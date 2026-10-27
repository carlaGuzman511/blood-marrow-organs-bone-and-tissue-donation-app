using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.Models.Responses
{
    /// <summary>A clinical donation request as the feed and the portal board show it.</summary>
    public class DonationRequestResponse
    {
        public Guid Id { get; set; }

        public int Folio { get; set; }

        /// <summary>Folio as people read it: "REQ-8902".</summary>
        public string Code { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public Urgency Urgency { get; set; }

        public BloodComponent Component { get; set; }

        public RequestStatus Status { get; set; }

        public BloodType BloodType { get; set; } = null!;

        public DonationTypeResponse DonationType { get; set; } = null!;

        public DonationCenterResponse? DonationCenter { get; set; }

        /// <summary>Who published it (public fields only), or null when staff without a profile did.</summary>
        public AuthorResponse? Author { get; set; }

        public int UnitsRequired { get; set; }

        public int UnitsCovered { get; set; }

        /// <summary>UnitsCovered over UnitsRequired, 0 to 100, rounded down.</summary>
        public int ProgressPercent { get; set; }

        public DateTime? Deadline { get; set; }

        /// <summary>
        /// Seconds left until the deadline while the request is open; negative once it is overdue.
        /// Null when it is closed. Computed when the response is built: count down from here.
        /// </summary>
        public long? RemainingSeconds { get; set; }

        public bool IsOverdue { get; set; }

        public DateTime? StatusChangedAt { get; set; }

        public AuthorResponse? StatusChangedBy { get; set; }

        /// <summary>
        /// Phases the caller may move it to now (the board's valid drop targets). Empty for callers
        /// who can't change phases and for closed requests.
        /// </summary>
        public IReadOnlyList<RequestStatus> AllowedNextStatuses { get; set; } = Array.Empty<RequestStatus>();

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        /// <summary>Only for clinical staff, network admins and the author; null for everyone else.</summary>
        public PatientDetailsResponse? Patient { get; set; }
    }

    /// <summary>Clinical data of a request. Never shown to other donors.</summary>
    public class PatientDetailsResponse
    {
        public string PatientCode { get; set; } = string.Empty;

        public int? PatientAge { get; set; }

        public string? Diagnosis { get; set; }

        public string? Service { get; set; }

        public string? Bed { get; set; }

        public string? MedicalRecord { get; set; }

        public string? CoordinationPhone { get; set; }
    }
}
