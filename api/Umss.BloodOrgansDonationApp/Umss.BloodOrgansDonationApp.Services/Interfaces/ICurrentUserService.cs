using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Services.Security;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    /// <summary>
    /// The caller of the current request and their local profile. Services use this instead of
    /// trusting a user id from the route or the body.
    /// </summary>
    public interface ICurrentUserService
    {
        /// <summary>The authenticated caller, or null for an anonymous request.</summary>
        CallerIdentity? Caller { get; }

        /// <summary>True when the caller holds network_admin (or the legacy admin role).</summary>
        bool IsNetworkAdmin { get; }

        /// <summary>
        /// The caller's local profile, or null when they have none yet. On the first call for a
        /// Keycloak user it links an existing profile with the same verified email.
        /// </summary>
        Task<User?> GetProfileAsync();

        /// <summary>The caller's profile id; throws ForbiddenException when they have no profile yet.</summary>
        Task<Guid> RequireProfileIdAsync();

        /// <summary>Throws ForbiddenException unless <paramref name="userId"/> is the caller's own profile or the caller is a network admin.</summary>
        Task EnsureSelfOrAdminAsync(Guid userId);
    }
}
