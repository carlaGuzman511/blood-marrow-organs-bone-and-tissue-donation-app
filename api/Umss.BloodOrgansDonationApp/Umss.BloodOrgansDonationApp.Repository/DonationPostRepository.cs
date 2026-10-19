using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;

namespace Umss.BloodOrgansDonationApp.Repository
{
    public class DonationPostRepository : IDonationPostRepository
    {
        private readonly DonationAppContext _appContext;

        public DonationPostRepository(DonationAppContext appContext)
        {
            _appContext = appContext;
        }

        public async Task<DonationPost> Create(DonationPost donationPost)
        {
            await _appContext.AddAsync(donationPost);
            await _appContext.SaveChangesAsync();
            return donationPost;
        }

        public async Task DeleteByUser(Guid userId, Guid donationPostId)
        {
            DonationPost? donationPost = await GetByUser(userId, donationPostId);
            if (donationPost != null)
            {
                _appContext.Remove(donationPost);
                await _appContext.SaveChangesAsync();
            }
        }

        public async Task DeleteByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            DonationPost? donationPost = await GetByDonationCenter(donationCenterId, donationPostId);
            if (donationPost != null)
            {
                _appContext.Remove(donationPost);
                await _appContext.SaveChangesAsync();
            }
        }

        public async Task<DonationPost?> GetByUser(Guid userId, Guid donationPostId)
        {
            return await QueryWithDetails()
                .FirstOrDefaultAsync(dp => dp.UserId == userId && dp.Id == donationPostId);
        }

        public async Task<IEnumerable<DonationPost>> Get()
        {
            return await QueryWithDetails()
                .OrderByDescending(dp => dp.CreatedAt)
                .ToListAsync();
        }

        public async Task<DonationPost?> GetByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            return await QueryWithDetails()
                .FirstOrDefaultAsync(dp => dp.DonationCenterId == donationCenterId && dp.Id == donationPostId);
        }

        public async Task<IEnumerable<DonationPost>> GetByUser(Guid userId)
        {
            return await QueryWithDetails()
                .Where(dp => dp.UserId == userId)
                .OrderByDescending(dp => dp.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<DonationPost>> GetByDonationCenter(Guid donationCenterId)
        {
            return await QueryWithDetails()
                .Where(dp => dp.DonationCenterId == donationCenterId)
                .OrderByDescending(dp => dp.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Persists the scalar values of <paramref name="donationPost"/>. The Get methods return
        /// untracked entities, so the change is copied onto a tracked instance before saving.
        /// Returns the post reloaded with its navigations so a changed BloodTypeId/DonationTypeId
        /// is reflected in the response.
        /// </summary>
        public async Task<DonationPost> Update(DonationPost donationPost)
        {
            DonationPost tracked = await _appContext.DonationPosts.FindAsync(donationPost.Id)
                ?? throw new EntityNotFoundException($"Donation Post with ID {donationPost.Id} not found.");

            _appContext.Entry(tracked).CurrentValues.SetValues(donationPost);
            await _appContext.SaveChangesAsync();

            return await QueryWithDetails().FirstAsync(dp => dp.Id == donationPost.Id);
        }

        private IQueryable<DonationPost> QueryWithDetails()
        {
            return _appContext.DonationPosts
                .Include(dp => dp.BloodType)
                .Include(dp => dp.DonationType)
                .Include(dp => dp.User)
                .Include(dp => dp.DonationCenter)
                .Include(dp => dp.Comments)
                    .ThenInclude(c => c.User)
                .AsNoTracking();
        }
    }
}
