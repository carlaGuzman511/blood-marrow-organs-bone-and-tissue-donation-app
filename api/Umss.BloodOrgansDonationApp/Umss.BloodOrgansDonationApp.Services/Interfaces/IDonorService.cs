using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    /// <summary>Donor search for any signed-in user: public fields only (see <see cref="DonorResponse"/>).</summary>
    public interface IDonorService
    {
        Task<PagedResult<DonorResponse>> GetAll(DonorQuery query);

        /// <summary>The donor, or null when there is no profile with this id.</summary>
        Task<DonorResponse?> Get(Guid id);
    }
}
