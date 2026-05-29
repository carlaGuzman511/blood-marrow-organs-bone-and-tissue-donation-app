namespace Umss.BloodOrgansDonationApp.Models.Requests
{
    public class CommentRequest
    {
        public required string Description { get; set; }

        public Guid UserId { get; set; }
    }
}
