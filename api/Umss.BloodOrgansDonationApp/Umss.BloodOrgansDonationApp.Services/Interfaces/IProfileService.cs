using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    /// <summary>The caller's own profile (<c>/api/me</c>). The caller always comes from the token.</summary>
    public interface IProfileService
    {
        /// <summary>The caller's profile; EntityNotFoundException (404) when they have none yet.</summary>
        Task<UserResponse> Get();

        /// <summary>Creates the caller's profile, linked to their Keycloak user; ConflictException (409) if one exists.</summary>
        Task<UserResponse> Create(ProfileRequest profileRequest);

        /// <summary>Updates the caller's profile; EntityNotFoundException (404) when they have none yet.</summary>
        Task<UserResponse> Update(ProfileRequest profileRequest);
    }
}
