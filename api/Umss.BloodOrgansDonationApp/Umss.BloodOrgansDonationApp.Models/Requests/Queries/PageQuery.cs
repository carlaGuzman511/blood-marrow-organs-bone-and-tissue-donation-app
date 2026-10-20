namespace Umss.BloodOrgansDonationApp.Models.Requests.Queries
{
    /// <summary>Paging for list endpoints (<c>?page=1&amp;pageSize=20</c>). Lists never return a whole table.</summary>
    public class PageQuery
    {
        public const int DefaultPageSize = 20;
        public const int MaxPageSize = 100;

        /// <summary>Page number, starting at 1. Default 1.</summary>
        public int Page { get; set; } = 1;

        /// <summary>Items per page, 1 to 100. Default 20.</summary>
        public int PageSize { get; set; } = DefaultPageSize;
    }

    /// <summary>Paging plus a free-text search.</summary>
    public class SearchPageQuery : PageQuery
    {
        public const int MaxSearchLength = 100;

        /// <summary>Case-insensitive text to look for. Empty means no search.</summary>
        public string? Search { get; set; }

        /// <summary>The trimmed, lower-cased search text, or null when there is none.</summary>
        public string? NormalizedSearch() =>
            string.IsNullOrWhiteSpace(Search) ? null : Search.Trim().ToLowerInvariant();
    }
}
