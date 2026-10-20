using Microsoft.AspNetCore.Identity;
using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.Models
{
    public class User : IdentityUser<Guid>
    {
        public required string FullName { get; set; }
        public BloodType BloodType { get; set; }
        public required Guid BloodTypeId { get; set; }
        public string Address { get; set; }

        /// <summary>City only, shown to other users in the donor directory (unlike the full address).</summary>
        public string? City { get; set; }
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
        public DateTime DateOfBirth { get; set; }
        public required string Image { get; set; }

        /// <summary>
        /// Keycloak user id (the token's <c>sub</c>) this profile belongs to. Unique; null until the
        /// user first calls the API with a Keycloak token (see CurrentUserService).
        /// </summary>
        public string? KeycloakSubject { get; set; }

        public ICollection<DonationPost> DonationPosts;

        public ICollection<Comment> Comments;
    }
}
