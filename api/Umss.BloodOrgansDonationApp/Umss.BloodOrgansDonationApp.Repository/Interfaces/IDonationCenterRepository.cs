using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface IDonationCenterRepository : IDonationAppRepository<DonationCenter>
    {
        /// <summary>One page of centers with their donation types, ordered by name.</summary>
        Task<PagedResult<DonationCenter>> GetAll(DonationCenterQuery query);
    }
}
