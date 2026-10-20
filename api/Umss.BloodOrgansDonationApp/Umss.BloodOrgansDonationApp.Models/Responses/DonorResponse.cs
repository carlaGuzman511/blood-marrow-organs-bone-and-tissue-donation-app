namespace Umss.BloodOrgansDonationApp.Models.Responses
{
    /// <summary>
    /// A donor as any signed-in user may see them (donor search). Public fields only: never add the
    /// address, phone, email, date of birth or exact location here; those stay in UserResponse
    /// (the user themself via /api/me, or network admins).
    /// </summary>
    public class DonorResponse
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public string? Image { get; set; }
        public string? City { get; set; }
        public Guid BloodTypeId { get; set; }
        public BloodType? BloodType { get; set; }
    }
}
