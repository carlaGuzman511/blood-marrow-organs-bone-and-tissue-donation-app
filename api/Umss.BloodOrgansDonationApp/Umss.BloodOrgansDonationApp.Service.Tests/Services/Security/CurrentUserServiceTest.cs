using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Security;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services.Security
{
    public class CurrentUserServiceTest
    {
        private const string Subject = "kc-subject-1";
        private const string Email = "ana@example.com";

        private readonly Mock<ICurrentUserAccessor> _accessor = new Mock<ICurrentUserAccessor>();
        private readonly Mock<IUserRepository> _users = new Mock<IUserRepository>(MockBehavior.Strict);

        private CurrentUserService CreateService(CallerIdentity? caller)
        {
            _accessor.Setup(a => a.GetCaller()).Returns(caller);
            return new CurrentUserService(_accessor.Object, _users.Object, NullLogger<CurrentUserService>.Instance);
        }

        private static CallerIdentity Caller(bool emailVerified = true, params string[] roles) =>
            new CallerIdentity(Subject, Email, emailVerified, roles.ToHashSet());

        private static User Profile(Guid? id = null, string? subject = null) => new User
        {
            Id = id ?? Guid.NewGuid(),
            FullName = "Ana",
            BloodTypeId = Guid.NewGuid(),
            Latitude = 0,
            Longitude = 0,
            Image = "a.png",
            Email = Email,
            KeycloakSubject = subject,
        };

        [Fact(DisplayName = "Anonymous: no profile, not admin, and profile-required actions are forbidden")]
        public async Task Anonymous()
        {
            CurrentUserService service = CreateService(null);

            Assert.Null(await service.GetProfileAsync());
            Assert.False(service.IsNetworkAdmin);
            await Assert.ThrowsAsync<ForbiddenException>(() => service.RequireProfileIdAsync());
        }

        [Fact(DisplayName = "A linked profile is found by subject without looking at the email")]
        public async Task LinkedBySubject()
        {
            User linked = Profile(subject: Subject);
            _users.Setup(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync(linked);
            CurrentUserService service = CreateService(Caller());

            Assert.Same(linked, await service.GetProfileAsync());
            _users.Verify(r => r.GetUnlinkedByEmailAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "A verified email links the single unlinked profile with that email")]
        public async Task VerifiedEmail_Links()
        {
            User legacy = Profile();
            User afterLink = Profile(legacy.Id, Subject);
            _users.SetupSequence(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync((User?)null).ReturnsAsync(afterLink);
            _users.Setup(r => r.GetUnlinkedByEmailAsync(Email)).ReturnsAsync(new[] { legacy });
            _users.Setup(r => r.TryLinkKeycloakSubjectAsync(legacy.Id, Subject)).ReturnsAsync(true);
            CurrentUserService service = CreateService(Caller());

            Assert.Same(afterLink, await service.GetProfileAsync());
            _users.Verify(r => r.TryLinkKeycloakSubjectAsync(legacy.Id, Subject), Times.Once);
        }

        [Fact(DisplayName = "An unverified email is never used to find or link a profile")]
        public async Task UnverifiedEmail_NeverLinks()
        {
            _users.Setup(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync((User?)null);
            CurrentUserService service = CreateService(Caller(emailVerified: false));

            Assert.Null(await service.GetProfileAsync());
            _users.Verify(r => r.GetUnlinkedByEmailAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "Two unlinked profiles with the same email: link neither")]
        public async Task AmbiguousEmail_DoesNotLink()
        {
            _users.Setup(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync((User?)null);
            _users.Setup(r => r.GetUnlinkedByEmailAsync(Email)).ReturnsAsync(new[] { Profile(), Profile() });
            CurrentUserService service = CreateService(Caller());

            Assert.Null(await service.GetProfileAsync());
            _users.Verify(r => r.TryLinkKeycloakSubjectAsync(It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "Losing a concurrent link race returns the profile the winner linked")]
        public async Task LinkRace_ReadsWinner()
        {
            User legacy = Profile();
            User winner = Profile(legacy.Id, Subject);
            _users.SetupSequence(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync((User?)null).ReturnsAsync(winner);
            _users.Setup(r => r.GetUnlinkedByEmailAsync(Email)).ReturnsAsync(new[] { legacy });
            _users.Setup(r => r.TryLinkKeycloakSubjectAsync(legacy.Id, Subject)).ReturnsAsync(false);
            CurrentUserService service = CreateService(Caller());

            Assert.Same(winner, await service.GetProfileAsync());
        }

        [Fact(DisplayName = "The profile is resolved once per request")]
        public async Task ResolvesOncePerRequest()
        {
            _users.Setup(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync(Profile(subject: Subject));
            CurrentUserService service = CreateService(Caller());

            await service.GetProfileAsync();
            await service.GetProfileAsync();
            await service.RequireProfileIdAsync();

            _users.Verify(r => r.GetByKeycloakSubjectAsync(Subject), Times.Once);
        }

        [Theory(DisplayName = "network_admin and the legacy admin role are network admins; donor is not")]
        [InlineData("network_admin", true)]
        [InlineData("admin", true)]
        [InlineData("donor", false)]
        [InlineData("clinical_staff", false)]
        public void IsNetworkAdmin(string role, bool expected)
        {
            CurrentUserService service = CreateService(Caller(true, role));

            Assert.Equal(expected, service.IsNetworkAdmin);
        }

        [Fact(DisplayName = "EnsureSelfOrAdmin: own id passes, another id is forbidden")]
        public async Task EnsureSelfOrAdmin_Donor()
        {
            User me = Profile(subject: Subject);
            _users.Setup(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync(me);
            CurrentUserService service = CreateService(Caller(true, "donor"));

            await service.EnsureSelfOrAdminAsync(me.Id);
            await Assert.ThrowsAsync<ForbiddenException>(() => service.EnsureSelfOrAdminAsync(Guid.NewGuid()));
        }

        [Fact(DisplayName = "EnsureSelfOrAdmin: a caller without a profile is forbidden")]
        public async Task EnsureSelfOrAdmin_NoProfile()
        {
            _users.Setup(r => r.GetByKeycloakSubjectAsync(Subject)).ReturnsAsync((User?)null);
            CurrentUserService service = CreateService(Caller(emailVerified: false, "donor"));

            await Assert.ThrowsAsync<ForbiddenException>(() => service.EnsureSelfOrAdminAsync(Guid.NewGuid()));
        }

        [Fact(DisplayName = "EnsureSelfOrAdmin: an admin passes for any id without a profile lookup")]
        public async Task EnsureSelfOrAdmin_Admin()
        {
            CurrentUserService service = CreateService(Caller(true, "network_admin"));

            await service.EnsureSelfOrAdminAsync(Guid.NewGuid());

            _users.VerifyNoOtherCalls();
        }
    }
}
