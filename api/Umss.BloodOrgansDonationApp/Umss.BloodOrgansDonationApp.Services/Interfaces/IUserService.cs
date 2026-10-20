using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    public interface IUserService : IDonationAppService<UserRequest, UserResponse>
    {
        /// <summary>One page of full profiles. Network admins only.</summary>
        Task<PagedResult<UserResponse>> GetAll(UserQuery query);

        Task<AuthResponse> LoginAsync(LoginRequest loginRequest);
    }
}
