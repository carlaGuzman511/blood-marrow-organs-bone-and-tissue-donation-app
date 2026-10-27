using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Extensions;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;

namespace Umss.BloodOrgansDonationApp.Repository
{
    public class CommentRepository : ICommentRepository
    {
        private readonly DonationAppContext _appContext;
        public CommentRepository(DonationAppContext appContext)
        {
            _appContext = appContext;
        }
        public async Task<Comment> Create(Comment element)
        {
            await _appContext.AddAsync(element);
            await _appContext.SaveChangesAsync();
            return element;
        }

        public async Task Delete(Guid donationPostId, Guid commentId)
        {
            Comment? comment = await Get(donationPostId, commentId);
            if (comment != null)
            {
                _appContext.Remove(comment);
            }

            await _appContext.SaveChangesAsync();
        }

        public async Task<Comment?> Get(Guid donationPostId, Guid commentId)
        {
            return await _appContext.Comments.AsNoTracking().Where(x => x.DonationPostId == donationPostId && x.Id == commentId).FirstOrDefaultAsync();
        }
        public async Task<PagedResult<Comment>> Get(Guid donationPostId, CommentQuery query)
        {
            // The author is included so the response can show who wrote it (public fields only).
            return await _appContext.Comments
                .AsNoTracking()
                .Where(c => c.DonationPostId == donationPostId)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .ThenBy(c => c.Id)
                .ToPagedResultAsync(query);
        }

        /// <summary>
        /// Persists the scalar values of <paramref name="element"/>. Get returns an untracked
        /// entity, so the change is copied onto a tracked instance before saving.
        /// </summary>
        public async Task<Comment> Update(Comment element)
        {
            Comment tracked = await _appContext.Comments.FindAsync(element.Id)
                ?? throw new EntityNotFoundException($"Comment with ID {element.Id} not found.");

            _appContext.Entry(tracked).CurrentValues.SetValues(element);
            await _appContext.SaveChangesAsync();

            return tracked;
        }
    }
}
