using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface IUserRepository : IDonationAppRepository<User>
    {
        /// <summary>One page of profiles with their blood type, ordered by name (network admins).</summary>
        Task<PagedResult<User>> GetAll(UserQuery query);

        Task<User?> GetByEmailAsync(string email);
        Task<bool> CheckPasswordAsync(User user, string password);
        Task<IEnumerable<string>> GetRolesAsync(User user);

        /// <summary>One page of profiles with their blood type, read-only, ordered by name (donor directory).</summary>
        Task<PagedResult<User>> GetDirectoryAsync(DonorQuery query);

        /// <summary>One profile with its blood type, read-only, or null (donor directory).</summary>
        Task<User?> GetDirectoryEntryAsync(Guid id);

        /// <summary>The profile linked to this Keycloak user, or null.</summary>
        Task<User?> GetByKeycloakSubjectAsync(string keycloakSubject);

        /// <summary>
        /// Profiles with this email (case-insensitive) that aren't linked to any Keycloak user yet.
        /// Returns a list: legacy data may hold the same email twice, and then nothing must be linked.
        /// </summary>
        Task<IReadOnlyList<User>> GetUnlinkedByEmailAsync(string email);

        /// <summary>True if any profile uses this email (case-insensitive).</summary>
        Task<bool> EmailExistsAsync(string email);

        /// <summary>
        /// Links the profile to the Keycloak user only if it is still unlinked. Returns false when it
        /// was linked meanwhile or the subject is already taken (concurrent first requests).
        /// </summary>
        Task<bool> TryLinkKeycloakSubjectAsync(Guid userId, string keycloakSubject);
    }
}
