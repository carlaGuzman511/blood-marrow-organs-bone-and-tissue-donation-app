using AutoMapper;
using FluentValidation;
using Moq;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.AutoMapper;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Security;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    public class ProfileServiceTest
    {
        private static readonly CallerIdentity Caller = new CallerIdentity("kc-1", "maria@example.com", true, new HashSet<string> { "donor" });

        private readonly Mock<ICurrentUserService> _currentUser = new Mock<ICurrentUserService>();
        private readonly Mock<IUserRepository> _users = new Mock<IUserRepository>();
        private readonly IMapper _mapper = new MapperConfiguration(cfg => cfg.AddMaps(typeof(UserProfile).Assembly)).CreateMapper();
        private readonly ProfileService _service;

        public ProfileServiceTest()
        {
            _currentUser.SetupGet(c => c.Caller).Returns(Caller);
            _service = new ProfileService(_currentUser.Object, _users.Object, _mapper);
        }

        private static ProfileRequest ValidRequest() => new ProfileRequest
        {
            FullName = "Maria Lopez",
            BloodTypeId = Guid.NewGuid(),
            Address = "Av. 1",
            DateOfBirth = new DateTime(1995, 6, 15),
            PhoneNumber = "+59171234567",
            Image = "maria.png",
            Latitude = -17.39,
            Longitude = -66.15,
        };

        private static User ExistingProfile() => new User
        {
            Id = Guid.NewGuid(),
            FullName = "Maria",
            BloodTypeId = Guid.NewGuid(),
            Latitude = 0,
            Longitude = 0,
            Image = "m.png",
            Email = Caller.Email,
            KeycloakSubject = Caller.Subject,
        };

        [Fact(DisplayName = "Get without a profile is EntityNotFound (404)")]
        public async Task Get_NoProfile()
        {
            await Assert.ThrowsAsync<EntityNotFoundException>(() => _service.Get());
        }

        [Fact(DisplayName = "Create takes the subject and email from the token, never from the body")]
        public async Task Create_UsesTokenIdentity()
        {
            User? saved = null;
            _users.Setup(r => r.Create(It.IsAny<User>())).Callback<User>(u => saved = u).ReturnsAsync((User u) => u);

            UserResponse response = await _service.Create(ValidRequest());

            Assert.NotNull(saved);
            Assert.Equal(Caller.Subject, saved!.KeycloakSubject);
            Assert.Equal(Caller.Email, saved.Email);
            Assert.Equal(Caller.Email, response.Email);
            Assert.NotEqual(Guid.Empty, saved.Id);
        }

        [Fact(DisplayName = "Create stores the date of birth as a UTC date (Npgsql rejects other kinds)")]
        public async Task Create_DateOfBirthIsUtc()
        {
            User? saved = null;
            _users.Setup(r => r.Create(It.IsAny<User>())).Callback<User>(u => saved = u).ReturnsAsync((User u) => u);

            await _service.Create(ValidRequest());

            Assert.Equal(DateTimeKind.Utc, saved!.DateOfBirth.Kind);
            Assert.Equal(new DateTime(1995, 6, 15), saved.DateOfBirth.Date);
        }

        [Fact(DisplayName = "Create when the caller already has a profile is a Conflict (409)")]
        public async Task Create_ProfileExists()
        {
            _currentUser.Setup(c => c.GetProfileAsync()).ReturnsAsync(ExistingProfile());

            await Assert.ThrowsAsync<ConflictException>(() => _service.Create(ValidRequest()));
            _users.Verify(r => r.Create(It.IsAny<User>()), Times.Never);
        }

        [Fact(DisplayName = "Create with an email another profile uses is a Conflict (409)")]
        public async Task Create_EmailTaken()
        {
            _users.Setup(r => r.EmailExistsAsync(Caller.Email!)).ReturnsAsync(true);

            await Assert.ThrowsAsync<ConflictException>(() => _service.Create(ValidRequest()));
            _users.Verify(r => r.Create(It.IsAny<User>()), Times.Never);
        }

        [Fact(DisplayName = "Create with a token that has no email is a 400")]
        public async Task Create_NoEmailInToken()
        {
            _currentUser.SetupGet(c => c.Caller).Returns(Caller with { Email = null });

            await Assert.ThrowsAsync<BusinessException>(() => _service.Create(ValidRequest()));
        }

        [Fact(DisplayName = "Create with invalid data throws ValidationException")]
        public async Task Create_Invalid()
        {
            ProfileRequest request = ValidRequest();
            request.FullName = "";
            request.DateOfBirth = DateTime.UtcNow.AddDays(1);

            ValidationException exception = await Assert.ThrowsAsync<ValidationException>(() => _service.Create(request));

            Assert.Contains(exception.Errors, e => e.PropertyName == nameof(ProfileRequest.FullName));
            Assert.Contains(exception.Errors, e => e.PropertyName == nameof(ProfileRequest.DateOfBirth));
        }

        [Fact(DisplayName = "Update without a profile is EntityNotFound (404)")]
        public async Task Update_NoProfile()
        {
            await Assert.ThrowsAsync<EntityNotFoundException>(() => _service.Update(ValidRequest()));
        }

        [Fact(DisplayName = "Update changes profile data but never the email or the Keycloak link")]
        public async Task Update_KeepsIdentity()
        {
            User profile = ExistingProfile();
            _currentUser.Setup(c => c.GetProfileAsync()).ReturnsAsync(profile);
            _users.Setup(r => r.Update(profile)).ReturnsAsync(profile);

            await _service.Update(ValidRequest());

            Assert.Equal("Maria Lopez", profile.FullName);
            Assert.Equal(Caller.Email, profile.Email);
            Assert.Equal(Caller.Subject, profile.KeycloakSubject);
            _users.Verify(r => r.Update(profile), Times.Once);
        }
    }
}
