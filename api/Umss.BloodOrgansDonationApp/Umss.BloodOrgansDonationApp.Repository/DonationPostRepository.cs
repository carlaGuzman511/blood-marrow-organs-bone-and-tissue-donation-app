using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Extensions;
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

        public async Task<PagedResult<DonationPost>> Get(DonationPostQuery query)
        {
            IQueryable<DonationPost> posts = Filter(_appContext.DonationPosts.AsNoTracking(), query);
            if (query.DonationCenterId.HasValue)
            {
                Guid donationCenterId = query.DonationCenterId.Value;
                posts = posts.Where(dp => dp.DonationCenterId == donationCenterId);
            }

            return await PageWithDetails(posts, query);
        }

        public async Task<DonationPost?> GetByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            return await QueryWithDetails()
                .FirstOrDefaultAsync(dp => dp.DonationCenterId == donationCenterId && dp.Id == donationPostId);
        }

        public async Task<PagedResult<DonationPost>> GetByUser(Guid userId, DonationPostQuery query)
        {
            IQueryable<DonationPost> posts = Filter(_appContext.DonationPosts.AsNoTracking(), query)
                .Where(dp => dp.UserId == userId);

            return await PageWithDetails(posts, query);
        }

        public async Task<PagedResult<DonationPost>> GetByDonationCenter(Guid donationCenterId, DonationPostQuery query)
        {
            // The route decides the center; query.DonationCenterId is ignored here.
            IQueryable<DonationPost> posts = Filter(_appContext.DonationPosts.AsNoTracking(), query)
                .Where(dp => dp.DonationCenterId == donationCenterId);

            return await PageWithDetails(posts, query);
        }

        private static IQueryable<DonationPost> Filter(IQueryable<DonationPost> posts, DonationPostQuery query)
        {
            string? search = query.NormalizedSearch();
            if (search != null)
            {
                posts = posts.Where(dp => dp.Title.ToLower().Contains(search) || dp.Description.ToLower().Contains(search));
            }

            if (query.BloodTypeId.HasValue)
            {
                Guid bloodTypeId = query.BloodTypeId.Value;
                posts = posts.Where(dp => dp.BloodTypeId == bloodTypeId);
            }

            if (query.DonationTypeId.HasValue)
            {
                Guid donationTypeId = query.DonationTypeId.Value;
                posts = posts.Where(dp => dp.DonationTypeId == donationTypeId);
            }

            if (query.Priority.HasValue)
            {
                bool priority = query.Priority.Value;
                posts = posts.Where(dp => dp.Priority == priority);
            }

            return posts;
        }

        /// <summary>
        /// Newest first; Id breaks ties so pages never overlap (served by IX_DonationPosts_CreatedAt_Id).
        /// Split query: one SQL per collection, so a page of posts isn't multiplied by its comments.
        /// </summary>
        private static Task<PagedResult<DonationPost>> PageWithDetails(IQueryable<DonationPost> posts, DonationPostQuery query)
        {
            return posts
                .Include(dp => dp.BloodType)
                .Include(dp => dp.DonationType)
                .Include(dp => dp.User)
                .Include(dp => dp.DonationCenter)
                .Include(dp => dp.Comments)
                    .ThenInclude(c => c.User)
                .AsSplitQuery()
                .OrderByDescending(dp => dp.CreatedAt)
                .ThenByDescending(dp => dp.Id)
                .ToPagedResultAsync(query);
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
