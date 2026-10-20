using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface IDonationTypeRepository : IDonationAppRepository<DonationType>
    {
        /// <summary>One page of donation types, ordered by name.</summary>
        Task<PagedResult<DonationType>> GetAll(DonationTypeQuery query);

        public Task<IEnumerable<DonationType>> GetByIds(IEnumerable<Guid> donationTypeIds);
    }
}
