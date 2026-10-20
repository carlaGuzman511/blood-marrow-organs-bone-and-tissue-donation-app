using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Extensions
{
    public static class QueryableExtensions
    {
        /// <summary>
        /// Counts the filtered rows, then loads only the requested page, both in the database.
        /// <paramref name="orderedQuery"/> must have a unique order (end with the key), or rows can
        /// repeat or go missing between pages. The query is assumed valid (see PageQueryValidator).
        /// </summary>
        public static async Task<PagedResult<T>> ToPagedResultAsync<T>(this IOrderedQueryable<T> orderedQuery, PageQuery page)
        {
            int totalCount = await orderedQuery.CountAsync();

            // long: a huge page number must give an empty page, not an int overflow.
            long skip = (long)(page.Page - 1) * page.PageSize;
            List<T> items = skip >= totalCount
                ? new List<T>()
                : await orderedQuery.Skip((int)skip).Take(page.PageSize).ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                Page = page.Page,
                PageSize = page.PageSize,
                TotalCount = totalCount,
            };
        }
    }
}
