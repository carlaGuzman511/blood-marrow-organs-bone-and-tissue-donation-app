namespace Umss.BloodOrgansDonationApp.Models.Entities
{
    /// <summary>
    /// One phase change of a clinical request: who moved it, when, and from where to where.
    /// Rows are only added, never edited, so they double as the audit trail.
    /// </summary>
    public class DonationRequestStatusChange
    {
        public Guid Id { get; set; }

        public Guid DonationPostId { get; set; }

        public DonationPost? DonationPost { get; set; }

        /// <summary>Null for the first entry, when the request is created.</summary>
        public RequestStatus? FromStatus { get; set; }

        public RequestStatus ToStatus { get; set; }

        /// <summary>The caller's local profile, when they have one (clinical staff may not).</summary>
        public Guid? ChangedById { get; set; }

        public User? ChangedBy { get; set; }

        /// <summary>Keycloak subject of the caller: always known, even without a local profile.</summary>
        public required string ChangedBySubject { get; set; }

        public DateTime ChangedAt { get; set; }

        /// <summary>Optional note, e.g. "Unidades completas" for an automatic completion.</summary>
        public string? Reason { get; set; }
    }
}
