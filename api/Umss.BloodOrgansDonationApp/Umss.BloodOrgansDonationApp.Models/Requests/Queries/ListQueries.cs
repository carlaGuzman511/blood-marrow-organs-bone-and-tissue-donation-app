namespace Umss.BloodOrgansDonationApp.Models.Requests.Queries
{
    /// <summary>GET /api/blood-types.</summary>
    public class BloodTypeQuery : PageQuery
    {
    }

    /// <summary>GET /api/donation-types. <c>search</c> looks in the name.</summary>
    public class DonationTypeQuery : SearchPageQuery
    {
    }

    /// <summary>GET /api/donation-centers. <c>search</c> looks in the name and address.</summary>
    public class DonationCenterQuery : SearchPageQuery
    {
        /// <summary>Only centers in this city (case-insensitive, exact).</summary>
        public string? City { get; set; }

        /// <summary>Only centers that offer this donation type.</summary>
        public Guid? DonationTypeId { get; set; }
    }

    /// <summary>Donation post lists. <c>search</c> looks in the title and description.</summary>
    public class DonationPostQuery : SearchPageQuery
    {
        /// <summary>Only posts asking for this blood type.</summary>
        public Guid? BloodTypeId { get; set; }

        /// <summary>Only posts of this donation type.</summary>
        public Guid? DonationTypeId { get; set; }

        /// <summary>Only posts published by this donation center (feed only).</summary>
        public Guid? DonationCenterId { get; set; }

        /// <summary>Only priority (true) or non-priority (false) posts.</summary>
        public bool? Priority { get; set; }
    }

    /// <summary>GET /api/users (network admins). <c>search</c> looks in the name and email.</summary>
    public class UserQuery : SearchPageQuery
    {
        /// <summary>Only users with this blood type.</summary>
        public Guid? BloodTypeId { get; set; }

        /// <summary>Only users in this city (case-insensitive, exact).</summary>
        public string? City { get; set; }
    }

    /// <summary>GET /api/donors. <c>search</c> looks in the name only (public fields).</summary>
    public class DonorQuery : SearchPageQuery
    {
        /// <summary>Only donors with this blood type.</summary>
        public Guid? BloodTypeId { get; set; }

        /// <summary>Only donors in this city (case-insensitive, exact).</summary>
        public string? City { get; set; }
    }
}
