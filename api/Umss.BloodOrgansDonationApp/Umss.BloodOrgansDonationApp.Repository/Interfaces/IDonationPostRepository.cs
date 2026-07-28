using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface IDonationPostRepository
    {
        Task<IEnumerable<DonationPostResponse>> GetByDonationCenter(Guid donationCenterId);
        Task<DonationPostResponse?> GetByDonationCenter(Guid donationCenterId, Guid donationPostId);
        Task<IEnumerable<DonationPostResponse>> GetByUser(Guid userId);
        Task<IEnumerable<DonationPostResponse>> Get();
        Task<DonationPostResponse?> GetByUser(Guid userId, Guid donationPostId);
        Task<DonationPost?> FindByDonationCenter(Guid donationCenterId, Guid donationPostId);
        Task<DonationPost?> FindByUser(Guid userId, Guid donationPostId);
        Task DeleteByDonationCenter(Guid donationCenterId, Guid donationPostId);
        Task DeleteByUser(Guid userId, Guid donationPostId);
        Task<DonationPost> Create(DonationPost donationPost);
        Task<DonationPost> Update(DonationPost donationPost);
    }
}
