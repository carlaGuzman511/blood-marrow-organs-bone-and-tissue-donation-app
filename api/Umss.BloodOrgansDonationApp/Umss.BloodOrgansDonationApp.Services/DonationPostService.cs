using AutoMapper;
using FluentValidation;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Validators;

namespace Umss.BloodOrgansDonationApp.Services
{
    public class DonationPostService : IDonationPostService
    {
        private readonly IDonationPostRepository _donationPostRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUser;
        public DonationPostService(IDonationPostRepository donationPostRepository, IMapper mapper, ICurrentUserService currentUser)
        {
            _donationPostRepository = donationPostRepository;
            _mapper = mapper;
            _currentUser = currentUser;
        }
        public async Task<DonationPostResponse> CreateByDonationCenter(Guid donationCenterId, DonationPostRequest donationPostRequest)
        {
            DonationPostRequestValidator donationPostRequestValidator = new DonationPostRequestValidator();
            donationPostRequestValidator.ValidateAndThrow(donationPostRequest);

            DonationPost donationPost = _mapper.Map<DonationPost>(donationPostRequest);
            donationPost.CreatedAt = DateTime.UtcNow;
            donationPost.Id = Guid.NewGuid();
            donationPost.DonationCenterId = donationCenterId;

            donationPost = await _donationPostRepository.Create(donationPost);

            return _mapper.Map<DonationPostResponse>(donationPost);
        }
        public async Task<DonationPostResponse> CreateByUser(Guid userId, DonationPostRequest donationPostRequest)
        {
            // The {userId} in the route is client-supplied: only the user themself (or an admin) may write under it.
            await _currentUser.EnsureSelfOrAdminAsync(userId);

            DonationPostRequestValidator donationPostRequestValidator = new DonationPostRequestValidator();
            donationPostRequestValidator.ValidateAndThrow(donationPostRequest);

            DonationPost donationPost = _mapper.Map<DonationPost>(donationPostRequest);
            donationPost.CreatedAt = DateTime.UtcNow;
            donationPost.Id = Guid.NewGuid();
            donationPost.UserId = userId;

            donationPost = await _donationPostRepository.Create(donationPost);

            return _mapper.Map<DonationPostResponse>(donationPost);
        }
        public async Task DeleteByUser(Guid userId, Guid donationPostId)
        {
            await _currentUser.EnsureSelfOrAdminAsync(userId);
            await _donationPostRepository.DeleteByUser(userId, donationPostId);
        }
        public async Task DeleteByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            await _donationPostRepository.DeleteByDonationCenter(donationCenterId, donationPostId);
        }
        public async Task<DonationPostResponse?> GetByUser(Guid userId, Guid donationPostId)
        {
            DonationPost? donationPost = await _donationPostRepository.GetByUser(userId, donationPostId);
            if (donationPost != null)
            {
                return _mapper.Map<DonationPostResponse>(donationPost);
            }
            else
            {
                return null;
            }
        }
        public async Task<DonationPostResponse?> GetByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            DonationPost? donationPost = await _donationPostRepository.GetByDonationCenter(donationCenterId, donationPostId);
            if (donationPost != null)
            {
                return _mapper.Map<DonationPostResponse>(donationPost);
            }
            else
            {
                return null;
            }
        }
        public async Task<PagedResult<DonationPostResponse>> GetByDonationCenter(Guid donationCenterId, DonationPostQuery query)
        {
            PageQueryValidator.Check(query);

            PagedResult<DonationPost> donationPosts = await _donationPostRepository.GetByDonationCenter(donationCenterId, query);
            return donationPosts.Map(dp => _mapper.Map<DonationPostResponse>(dp));
        }
        public async Task<PagedResult<DonationPostResponse>> GetByUser(Guid userId, DonationPostQuery query)
        {
            PageQueryValidator.Check(query);

            PagedResult<DonationPost> donationPosts = await _donationPostRepository.GetByUser(userId, query);
            return donationPosts.Map(dp => _mapper.Map<DonationPostResponse>(dp));
        }

        public async Task<PagedResult<DonationPostResponse>> Get(DonationPostQuery query)
        {
            PageQueryValidator.Check(query);

            PagedResult<DonationPost> donationPosts = await _donationPostRepository.Get(query);
            return donationPosts.Map(dp => _mapper.Map<DonationPostResponse>(dp));
        }
        public async Task<DonationPostResponse> UpdateByUser(Guid userId, Guid donationPostId, DonationPostRequest donationPostRequest)
        {
            await _currentUser.EnsureSelfOrAdminAsync(userId);

            DonationPost? donationPost = await _donationPostRepository.GetByUser(userId, donationPostId);
            if (donationPost == null)
            {
                throw new EntityNotFoundException($"Donation Post with ID {donationPostId} not found.");
            }

            DonationPostRequestValidator donationPostRequestValidator = new DonationPostRequestValidator();
            donationPostRequestValidator.ValidateAndThrow(donationPostRequest);

            _mapper.Map(donationPostRequest, donationPost);

            donationPost.Id = donationPostId;
            donationPost.UserId = userId;
            donationPost.UpdatedAt = DateTime.UtcNow;

            donationPost = await _donationPostRepository.Update(donationPost);

            return _mapper.Map<DonationPostResponse>(donationPost);
        }
        public async Task<DonationPostResponse> UpdateByDonationCenter(Guid donationCenterId, Guid donationPostId, DonationPostRequest donationPostRequest)
        {
            DonationPost? donationPost = await _donationPostRepository.GetByDonationCenter(donationCenterId, donationPostId);
            if (donationPost == null)
            {
                throw new EntityNotFoundException($"Donation Post with ID {donationPostId} not found.");
            }

            DonationPostRequestValidator donationPostRequestValidator = new DonationPostRequestValidator();
            donationPostRequestValidator.ValidateAndThrow(donationPostRequest);

            _mapper.Map(donationPostRequest, donationPost);

            donationPost.Id = donationPostId;
            donationPost.DonationCenterId = donationCenterId;
            donationPost.UpdatedAt = DateTime.UtcNow;

            donationPost = await _donationPostRepository.Update(donationPost);

            return _mapper.Map<DonationPostResponse>(donationPost);
        }
    }
}
