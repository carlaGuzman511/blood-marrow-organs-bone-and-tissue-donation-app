using AutoMapper;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Security;
using Umss.BloodOrgansDonationApp.Services.Validators;

namespace Umss.BloodOrgansDonationApp.Services
{
    public class ProfileService : IProfileService
    {
        private const string NoProfileMessage = "You have no profile yet. Create it with POST /api/me.";

        private readonly ICurrentUserService _currentUser;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public ProfileService(ICurrentUserService currentUser, IUserRepository userRepository, IMapper mapper)
        {
            _currentUser = currentUser;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<UserResponse> Get()
        {
            User profile = await _currentUser.GetProfileAsync()
                ?? throw new EntityNotFoundException(NoProfileMessage);

            return _mapper.Map<UserResponse>(profile);
        }

        public async Task<UserResponse> Create(ProfileRequest profileRequest)
        {
            CallerIdentity caller = _currentUser.Caller
                ?? throw new ForbiddenException("Authentication is required.");

            if (await _currentUser.GetProfileAsync() != null)
            {
                throw new ConflictException("You already have a profile. Use PUT /api/me to change it.");
            }

            new ProfileRequestValidator().ValidateAndThrow(profileRequest);

            if (string.IsNullOrWhiteSpace(caller.Email))
            {
                throw new BusinessException("Your account has no email address. Add one in your account settings and sign in again.");
            }

            // A verified email with a single unlinked profile was already linked above, so reaching
            // this point means the email is taken (or unverified): never create a second profile for it.
            if (await _userRepository.EmailExistsAsync(caller.Email))
            {
                throw new ConflictException("A profile with this email already exists. Verify your email in your account and sign in again to link it.");
            }

            User user = _mapper.Map<User>(profileRequest);
            user.Id = Guid.NewGuid();
            user.KeycloakSubject = caller.Subject;
            user.Email = caller.Email;
            user.NormalizedEmail = caller.Email.ToUpperInvariant();
            user.UserName = caller.Email;
            user.NormalizedUserName = caller.Email.ToUpperInvariant();
            user.DateOfBirth = AsUtcDate(profileRequest.DateOfBirth);

            try
            {
                await _userRepository.Create(user);
            }
            catch (DbUpdateException)
            {
                // Unique KeycloakSubject: a concurrent POST /api/me created it first.
                throw new ConflictException("You already have a profile. Use PUT /api/me to change it.");
            }

            User created = await _userRepository.GetByKeycloakSubjectAsync(caller.Subject) ?? user;
            return _mapper.Map<UserResponse>(created);
        }

        public async Task<UserResponse> Update(ProfileRequest profileRequest)
        {
            User profile = await _currentUser.GetProfileAsync()
                ?? throw new EntityNotFoundException(NoProfileMessage);

            new ProfileRequestValidator().ValidateAndThrow(profileRequest);

            _mapper.Map(profileRequest, profile);
            profile.DateOfBirth = AsUtcDate(profileRequest.DateOfBirth);

            await _userRepository.Update(profile);

            User updated = await _userRepository.GetByKeycloakSubjectAsync(profile.KeycloakSubject!) ?? profile;
            return _mapper.Map<UserResponse>(updated);
        }

        // Dates arrive without a Kind ("1990-04-15"); Npgsql only accepts UTC for timestamptz.
        private static DateTime AsUtcDate(DateTime date) => DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
    }
}
