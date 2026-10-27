using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.Models.Requests
{
    /// <summary>
    /// Body of POST and PUT /api/donation-requests. The author comes from the token, and the
    /// phase and covered units are never set here (see the status and units endpoints).
    /// Enums are sent as text: "CodeRed", "PlateletsApheresis".
    /// </summary>
    public class DonationRequestRequest
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string? Image { get; set; }

        public Guid BloodTypeId { get; set; }

        public Guid DonationTypeId { get; set; }

        /// <summary>The hospital or blood bank where the units are needed.</summary>
        public Guid DonationCenterId { get; set; }

        public BloodComponent? Component { get; set; }

        public Urgency? Urgency { get; set; }

        public int? UnitsRequired { get; set; }

        /// <summary>UTC. A time without an offset is read as UTC.</summary>
        public DateTime? Deadline { get; set; }

        public string PatientCode { get; set; } = string.Empty;

        public int? PatientAge { get; set; }

        public string? Diagnosis { get; set; }

        public string? Service { get; set; }

        public string? Bed { get; set; }

        public string? MedicalRecord { get; set; }

        public string CoordinationPhone { get; set; } = string.Empty;
    }

    /// <summary>Body of PATCH /api/donation-requests/{id}/status.</summary>
    public class RequestStatusChangeRequest
    {
        public RequestStatus? Status { get; set; }

        /// <summary>Optional note kept in the history, e.g. "Serologia reactiva".</summary>
        public string? Reason { get; set; }
    }

    /// <summary>Body of POST /api/donation-requests/{id}/units: units received and validated.</summary>
    public class RequestUnitsRequest
    {
        public int Units { get; set; } = 1;
    }
}
