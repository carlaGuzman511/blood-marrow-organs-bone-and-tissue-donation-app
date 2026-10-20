using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface IBloodTypeRepository : IDonationAppRepository<BloodType>
    {
        /// <summary>One page of blood types, ordered by name.</summary>
        Task<PagedResult<BloodType>> GetAll(BloodTypeQuery query);
    }
}
