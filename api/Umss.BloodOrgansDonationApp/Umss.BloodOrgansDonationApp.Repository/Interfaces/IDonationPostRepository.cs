using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface IDonationPostRepository
    {
        /// <summary>One page of the center's posts, newest first.</summary>
        public Task<PagedResult<DonationPost>> GetByDonationCenter(Guid donationCenterId, DonationPostQuery query);
        public Task<DonationPost?> GetByDonationCenter(Guid donationCenterId, Guid DonationPostId);
        /// <summary>One page of the user's posts, newest first.</summary>
        public Task<PagedResult<DonationPost>> GetByUser(Guid userId, DonationPostQuery query);

        /// <summary>One page of the feed, newest first.</summary>
        public Task<PagedResult<DonationPost>> Get(DonationPostQuery query);
        public Task<DonationPost?> GetByUser(Guid userId, Guid DonationPostId);
        public Task DeleteByDonationCenter(Guid donationCenterId, Guid DonationPostId);
        public Task DeleteByUser(Guid userId, Guid DonationPostId);
        public Task<DonationPost> Create(DonationPost donationPost);
        public Task<DonationPost> Update(DonationPost donationPost);
    }
}
