using Microsoft.Extensions.Logging;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.Services.Security
{
    /// <summary>
    /// Resolves the caller's local <see cref="User"/> profile from the Keycloak token (scoped: once per request).
    /// <para>
    /// Lookup order: the profile linked to the token's <c>sub</c>; otherwise, only when Keycloak says the
    /// email is verified, the single unlinked profile with that email, which is then linked. An unverified
    /// email is never used: anyone can put any address on an account, and linking on it would hand over
    /// someone else's profile.
    /// </para>
    /// </summary>
    public class CurrentUserService : ICurrentUserService
    {
        private readonly ICurrentUserAccessor _accessor;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<CurrentUserService> _logger;

        private bool _resolved;
        private User? _profile;

        public CurrentUserService(ICurrentUserAccessor accessor, IUserRepository userRepository, ILogger<CurrentUserService> logger)
        {
            _accessor = accessor;
            _userRepository = userRepository;
            _logger = logger;
        }

        public CallerIdentity? Caller => _accessor.GetCaller();

        public bool IsNetworkAdmin => Caller?.IsNetworkAdmin ?? false;

        public async Task<User?> GetProfileAsync()
        {
            if (!_resolved)
            {
                _profile = await ResolveAsync();
                _resolved = true;
            }

            return _profile;
        }

        public async Task<Guid> RequireProfileIdAsync()
        {
            User? profile = await GetProfileAsync();
            if (profile == null)
            {
                throw new ForbiddenException("Complete your profile (POST /api/me) before doing this.");
            }

            return profile.Id;
        }

        public async Task EnsureSelfOrAdminAsync(Guid userId)
        {
            if (IsNetworkAdmin)
            {
                return;
            }

            User? profile = await GetProfileAsync();
            if (profile == null || profile.Id != userId)
            {
                throw new ForbiddenException("You can only access your own data.");
            }
        }

        private async Task<User?> ResolveAsync()
        {
            CallerIdentity? caller = Caller;
            if (caller == null)
            {
                return null;
            }

            User? linked = await _userRepository.GetByKeycloakSubjectAsync(caller.Subject);
            if (linked != null)
            {
                return linked;
            }

            if (!caller.EmailVerified || string.IsNullOrWhiteSpace(caller.Email))
            {
                return null;
            }

            IReadOnlyList<User> candidates = await _userRepository.GetUnlinkedByEmailAsync(caller.Email);
            if (candidates.Count != 1)
            {
                if (candidates.Count > 1)
                {
                    _logger.LogWarning("Not linking Keycloak user {Subject}: {Count} unlinked profiles share its email.", caller.Subject, candidates.Count);
                }

                return null;
            }

            if (!await _userRepository.TryLinkKeycloakSubjectAsync(candidates[0].Id, caller.Subject))
            {
                // Another request linked it first (or this subject is linked elsewhere): read the winner.
                return await _userRepository.GetByKeycloakSubjectAsync(caller.Subject);
            }

            _logger.LogInformation("Linked Keycloak user {Subject} to existing profile {UserId} by verified email.", caller.Subject, candidates[0].Id);

            return await _userRepository.GetByKeycloakSubjectAsync(caller.Subject);
        }
    }
}
