namespace Umss.BloodOrgansDonationApp.Models.Requests
{
    /// <summary>
    /// The caller's own profile (<c>/api/me</c>). Email and password are not here on purpose:
    /// both are owned by Keycloak; the email is taken from the token.
    /// </summary>
    public class ProfileRequest
    {
        public required string FullName { get; set; }
        public Guid BloodTypeId { get; set; }
        public required string Address { get; set; }
        /// <summary>Optional. Public: other users see it in the donor directory.</summary>
        public string? City { get; set; }
        public DateTime DateOfBirth { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Image { get; set; }
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
    }
}
