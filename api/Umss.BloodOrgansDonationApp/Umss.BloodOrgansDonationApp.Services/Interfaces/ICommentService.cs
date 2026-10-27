using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    public interface ICommentService
    {
        public Task<PagedResult<CommentResponse>> Get(Guid DonationPostId, CommentQuery query);
        public Task<CommentResponse?> Get(Guid DonationPostId, Guid commentId);
        public Task<CommentResponse> Create(Guid DonationPostId, CommentRequest commentRequest);
        public Task<CommentResponse> Update(Guid DonationPostId, Guid commentId, CommentRequest commentRequest);
        public Task Delete(Guid DonationPostId, Guid commentId);
    }
}
