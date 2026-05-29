using Microsoft.AspNetCore.Identity;
using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.Models
{
    public class User: IdentityUser<Guid>
    {
        public required string FullName { get; set; }
        public BloodType BloodType { get; set; }
        public required Guid BloodTypeId { get; set; }
        public string Address { get; set; }
        public required double Latitude { get; set; }
        public required double Longitude { get; set; }
        public DateTime DateOfBirth { get; set; }
        public required string Image { get; set; }

        public ICollection<DonationPost> DonationPosts;

        public ICollection<Comment> Comments;
    }
}
