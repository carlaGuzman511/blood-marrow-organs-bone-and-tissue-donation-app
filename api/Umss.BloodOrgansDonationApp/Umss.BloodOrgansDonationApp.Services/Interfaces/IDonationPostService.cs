using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    public interface IDonationPostService
    {
        public Task<PagedResult<DonationPostResponse>> GetByDonationCenter(Guid donationCenterId, DonationPostQuery query);
        public Task<DonationPostResponse?> GetByDonationCenter(Guid donationCenterId, Guid DonationPostId);
        public Task<DonationPostResponse> CreateByDonationCenter(Guid donationCenterId, DonationPostRequest donationPostRequest);
        public Task<DonationPostResponse> UpdateByDonationCenter(Guid donationCenterId, Guid DonationPostId, DonationPostRequest donationPostRequest);
        public Task DeleteByDonationCenter(Guid donationCenterId, Guid DonationPostId);

        public Task<PagedResult<DonationPostResponse>> GetByUser(Guid userId, DonationPostQuery query);
        public Task<DonationPostResponse?> GetByUser(Guid userId, Guid DonationPostId);
        public Task<PagedResult<DonationPostResponse>> Get(DonationPostQuery query);
        public Task<DonationPostResponse> CreateByUser(Guid userId, DonationPostRequest donationPostRequest);
        public Task<DonationPostResponse> UpdateByUser(Guid userId, Guid DonationPostId, DonationPostRequest donationPostRequest);
        public Task DeleteByUser(Guid userId, Guid DonationPostId);
    }
}
