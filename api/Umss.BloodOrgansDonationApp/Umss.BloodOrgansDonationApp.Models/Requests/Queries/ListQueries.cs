using Umss.BloodOrgansDonationApp.Models.Entities;

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

        /// <summary>Only priority (true: Priority or CodeRed urgency) or standard (false) posts.</summary>
        public bool? Priority { get; set; }
    }

    /// <summary>
    /// GET /api/donation-requests: the board and its filters. <c>search</c> looks in the title,
    /// the description and the folio ("REQ-8902" or "8902"); clinical staff also match the patient code.
    /// </summary>
    public class DonationRequestQuery : SearchPageQuery
    {
        /// <summary>Maximum number of blood types in one query.</summary>
        public const int MaxBloodTypes = 8;

        /// <summary>Only this urgency: Standard, Priority or CodeRed.</summary>
        public Urgency? Urgency { get; set; }

        /// <summary>Only this component: WholeBlood, PlateletsApheresis, BoneMarrow or OrganTissue.</summary>
        public BloodComponent? Component { get; set; }

        /// <summary>Only these blood types. Repeat it for several: <c>?bloodTypeId=a&amp;bloodTypeId=b</c>.</summary>
        public List<Guid>? BloodTypeId { get; set; }

        /// <summary>Only this phase: SearchingDonors, DonorsOnTheWay, LabValidation, Completed or Cancelled.</summary>
        public RequestStatus? Status { get; set; }

        /// <summary>true: only open requests (not Completed or Cancelled). false: only closed ones.</summary>
        public bool? Open { get; set; }

        /// <summary>Only requests of this hospital or blood bank.</summary>
        public Guid? DonationCenterId { get; set; }

        /// <summary>Only requests whose phase changed at or after this UTC moment (e.g. completed today).</summary>
        public DateTime? StatusChangedSince { get; set; }
    }

    /// <summary>GET /api/posts/{id}/comments: oldest first, like a conversation.</summary>
    public class CommentQuery : PageQuery
    {
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
