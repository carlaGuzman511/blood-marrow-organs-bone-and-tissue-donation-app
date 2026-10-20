namespace Umss.BloodOrgansDonationApp.Models.Responses
{
    /// <summary>One page of a list endpoint plus what the client needs to page through it.</summary>
    public sealed class PagedResult<T>
    {
        public required IReadOnlyList<T> Items { get; init; }

        /// <summary>Page number, starting at 1.</summary>
        public required int Page { get; init; }

        public required int PageSize { get; init; }

        /// <summary>Rows matching the filters, across all pages.</summary>
        public required int TotalCount { get; init; }

        public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);

        public PagedResult<TOut> Map<TOut>(Func<T, TOut> map) => new PagedResult<TOut>
        {
            Items = Items.Select(map).ToList(),
            Page = Page,
            PageSize = PageSize,
            TotalCount = TotalCount,
        };
    }
}
