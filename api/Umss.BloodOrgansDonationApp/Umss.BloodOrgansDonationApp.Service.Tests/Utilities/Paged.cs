using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Utilities
{
    /// <summary>A repository page holding exactly these items (first page, default size).</summary>
    public static class Paged
    {
        public static PagedResult<T> Of<T>(IEnumerable<T> items)
        {
            List<T> list = items.ToList();
            return new PagedResult<T> { Items = list, Page = 1, PageSize = 20, TotalCount = list.Count };
        }
    }
}
