using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    public interface IBloodTypeService : IDonationAppService<BloodTypeRequest, BloodType>
    {
        Task<PagedResult<BloodType>> GetAll(BloodTypeQuery query);
    }
}
