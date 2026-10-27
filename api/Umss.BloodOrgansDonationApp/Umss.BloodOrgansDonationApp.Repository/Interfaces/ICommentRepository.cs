using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    public interface ICommentRepository
    {
        /// <summary>One page of the post's comments with their authors, oldest first.</summary>
        public Task<PagedResult<Comment>> Get(Guid donationPostId, CommentQuery query);
        public Task<Comment?> Get(Guid donationPostId, Guid commentId);
        public Task<Comment> Create(Comment comment);
        public Task<Comment> Update(Comment comment);
        public Task Delete(Guid donationPostId, Guid commentId);
    }
}
