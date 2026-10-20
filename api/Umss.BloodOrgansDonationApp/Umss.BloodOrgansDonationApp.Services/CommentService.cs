using AutoMapper;
using FluentValidation;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Validators;

namespace Umss.BloodOrgansDonationApp.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUser;
        public CommentService(ICommentRepository commentRepository, IMapper mapper, ICurrentUserService currentUser)
        {
            _commentRepository = commentRepository;
            _mapper = mapper;
            _currentUser = currentUser;
        }
        public async Task<CommentResponse> Create(Guid donationPostId, CommentRequest commentRequest)
        {
            CommentRequestValidator commentRequestValidator = new CommentRequestValidator();
            commentRequestValidator.ValidateAndThrow(commentRequest);

            Comment comment = _mapper.Map<Comment>(commentRequest);
            // The author is the caller, never the UserId sent in the body.
            comment.UserId = await _currentUser.RequireProfileIdAsync();
            comment.Id = Guid.NewGuid();
            comment.CreatedAt = DateTime.UtcNow;
            comment.DonationPostId = donationPostId;

            comment = await _commentRepository.Create(comment);

            return _mapper.Map<CommentResponse>(comment);
        }

        public async Task Delete(Guid donationPostId, Guid commentId)
        {
            Comment? comment = await _commentRepository.Get(donationPostId, commentId);
            if (comment == null)
            {
                throw new EntityNotFoundException($"Comment with ID {commentId} from post ID {donationPostId} not found.");
            }

            await EnsureAuthorOrAdminAsync(comment);
            await _commentRepository.Delete(donationPostId, commentId);
        }

        public async Task<CommentResponse?> Get(Guid donationPostId, Guid commentId)
        {
            Comment? comment = await _commentRepository.Get(donationPostId, commentId);
            if (comment != null)
            {
                return _mapper.Map<CommentResponse>(comment);
            }
            else
            {
                return null;
            }
        }

        public async Task<IEnumerable<CommentResponse>> Get(Guid donationPostId)
        {
            IEnumerable<Comment> comments = await _commentRepository.Get(donationPostId);
            IEnumerable<CommentResponse> response = comments.Select(x => _mapper.Map<CommentResponse>(x));

            return response;
        }
        public async Task<CommentResponse> Update(Guid donationPostId, Guid commentId, CommentRequest commentRequest)
        {
            Comment? comment = await _commentRepository.Get(donationPostId, commentId);
            if (comment == null)
            {
                throw new EntityNotFoundException($"Comment with ID {commentId} from post ID {donationPostId} not found.");
            }

            await EnsureAuthorOrAdminAsync(comment);

            CommentRequestValidator commentRequestValidator = new CommentRequestValidator();
            commentRequestValidator.ValidateAndThrow(commentRequest);

            // CommentRequest carries UserId (needed on create); an edit must never reassign the author.
            Guid authorId = comment.UserId;

            _mapper.Map(commentRequest, comment);
            comment.UserId = authorId;
            comment.UpdatedAt = DateTime.UtcNow;
            comment.DonationPostId = donationPostId;
            comment.Id = commentId;

            comment = await _commentRepository.Update(comment);

            return _mapper.Map<CommentResponse>(comment);
        }

        private async Task EnsureAuthorOrAdminAsync(Comment comment)
        {
            if (_currentUser.IsNetworkAdmin)
            {
                return;
            }

            User? caller = await _currentUser.GetProfileAsync();
            if (caller == null || caller.Id != comment.UserId)
            {
                throw new ForbiddenException("You can only change your own comments.");
            }
        }
    }
}
