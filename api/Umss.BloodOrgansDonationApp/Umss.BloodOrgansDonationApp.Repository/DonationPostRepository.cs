using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Responses;
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

        public Task DeleteByUser(Guid userId, Guid donationPostId) =>
            _appContext.DonationPosts
                .Where(dp => dp.UserId == userId && dp.Id == donationPostId)
                .ExecuteDeleteAsync();

        public Task DeleteByDonationCenter(Guid donationCenterId, Guid donationPostId) =>
            _appContext.DonationPosts
                .Where(dp => dp.DonationCenterId == donationCenterId && dp.Id == donationPostId)
                .ExecuteDeleteAsync();

        public Task<DonationPost?> FindByUser(Guid userId, Guid donationPostId) =>
            _appContext.DonationPosts
                .FirstOrDefaultAsync(dp => dp.UserId == userId && dp.Id == donationPostId);

        public Task<DonationPost?> FindByDonationCenter(Guid donationCenterId, Guid donationPostId) =>
            _appContext.DonationPosts
                .FirstOrDefaultAsync(dp => dp.DonationCenterId == donationCenterId && dp.Id == donationPostId);

        public async Task<DonationPostResponse?> GetByUser(Guid userId, Guid donationPostId) =>
            await Project(_appContext.DonationPosts.Where(dp => dp.UserId == userId && dp.Id == donationPostId))
                .FirstOrDefaultAsync();

        public async Task<DonationPostResponse?> GetByDonationCenter(Guid donationCenterId, Guid donationPostId) =>
            await Project(_appContext.DonationPosts.Where(dp => dp.DonationCenterId == donationCenterId && dp.Id == donationPostId))
                .FirstOrDefaultAsync();

        public async Task<IEnumerable<DonationPostResponse>> Get() =>
            await Project(_appContext.DonationPosts)
                .OrderByDescending(dp => dp.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<DonationPostResponse>> GetByUser(Guid userId) =>
            await Project(_appContext.DonationPosts.Where(dp => dp.UserId == userId))
                .OrderByDescending(dp => dp.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<DonationPostResponse>> GetByDonationCenter(Guid donationCenterId) =>
            await Project(_appContext.DonationPosts.Where(dp => dp.DonationCenterId == donationCenterId))
                .OrderByDescending(dp => dp.CreatedAt)
                .ToListAsync();

        public async Task<DonationPost> Update(DonationPost donationPost)
        {
            await _appContext.SaveChangesAsync();
            return donationPost;
        }

        private static IQueryable<DonationPostResponse> Project(IQueryable<DonationPost> posts) =>
            posts.AsNoTracking().Select(dp => new DonationPostResponse
            {
                Id = dp.Id,
                Title = dp.Title,
                Description = dp.Description,
                Image = dp.Image,
                CreatedAt = dp.CreatedAt,
                UpdatedAt = dp.UpdatedAt,
                BloodType = new BloodType
                {
                    Id = dp.BloodType.Id,
                    Name = dp.BloodType.Name,
                    Image = dp.BloodType.Image
                },
                DonationType = new DonationTypeResponse
                {
                    Id = dp.DonationType.Id,
                    Name = dp.DonationType.Name,
                    Description = dp.DonationType.Description,
                    Requirements = dp.DonationType.Requirements,
                    Process = dp.DonationType.Process,
                    Importance = dp.DonationType.Importance,
                    Benefits = dp.DonationType.Benefits,
                    SecondaryEffects = dp.DonationType.SecondaryEffects,
                    Image = dp.DonationType.Image
                },
                User = dp.User == null ? null : new UserResponse
                {
                    Id = dp.User.Id,
                    FullName = dp.User.FullName,
                    Email = dp.User.Email ?? string.Empty,
                    BloodTypeId = dp.User.BloodTypeId,
                    Password = string.Empty,
                    Address = dp.User.Address,
                    DateOfBirth = dp.User.DateOfBirth,
                    PhoneNumber = dp.User.PhoneNumber ?? string.Empty,
                    Image = dp.User.Image,
                    Latitude = dp.User.Latitude,
                    Longitude = dp.User.Longitude
                },
                DonationCenter = dp.DonationCenter == null ? null : new DonationCenterResponse
                {
                    Id = dp.DonationCenter.Id,
                    Name = dp.DonationCenter.Name,
                    Address = dp.DonationCenter.Address,
                    Image = dp.DonationCenter.Image,
                    City = dp.DonationCenter.City,
                    Latitude = dp.DonationCenter.Latitude,
                    Longitude = dp.DonationCenter.Longitude,
                    DonationTypes = dp.DonationCenter.DonationCenterDonationTypes
                        .Select(link => new DonationTypeResponse
                        {
                            Id = link.DonationType.Id,
                            Name = link.DonationType.Name,
                            Description = link.DonationType.Description,
                            Requirements = link.DonationType.Requirements,
                            Process = link.DonationType.Process,
                            Importance = link.DonationType.Importance,
                            Benefits = link.DonationType.Benefits,
                            SecondaryEffects = link.DonationType.SecondaryEffects,
                            Image = link.DonationType.Image
                        }).ToList()
                },
                Comments = dp.Comments.Select(comment => new CommentResponse
                {
                    Id = comment.Id,
                    Description = comment.Description,
                    DonationPostId = comment.DonationPostId,
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt,
                    User = new UserResponse
                    {
                        Id = comment.User.Id,
                        FullName = comment.User.FullName,
                        Email = comment.User.Email ?? string.Empty,
                        BloodTypeId = comment.User.BloodTypeId,
                        Password = string.Empty,
                        Address = comment.User.Address,
                        DateOfBirth = comment.User.DateOfBirth,
                        PhoneNumber = comment.User.PhoneNumber ?? string.Empty,
                        Image = comment.User.Image,
                        Latitude = comment.User.Latitude,
                        Longitude = comment.User.Longitude
                    }
                }).ToList()
            });
    }
}
