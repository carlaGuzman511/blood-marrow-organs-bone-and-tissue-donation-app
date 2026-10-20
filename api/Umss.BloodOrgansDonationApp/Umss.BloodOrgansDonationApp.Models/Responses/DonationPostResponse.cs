namespace Umss.BloodOrgansDonationApp.Models.Responses
{
    public class DonationPostResponse
    {
        public Guid Id { get; set; }
        public BloodType BloodType { get; set; }
        public DonationTypeResponse DonationType { get; set; }

        public bool Priority { get; set; }
        /// <summary>The user who published the post (public fields only), or null for a center post.</summary>
        public AuthorResponse? User { get; set; }
        public DonationCenterResponse? DonationCenter { get; set; }
        public string Title { get; set; } = string.Empty;
        public required string Description { get; set; }
        public required string Image { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ICollection<CommentResponse> Comments { get; set; }
        public int CommentCount { get; set; }
    }
}
