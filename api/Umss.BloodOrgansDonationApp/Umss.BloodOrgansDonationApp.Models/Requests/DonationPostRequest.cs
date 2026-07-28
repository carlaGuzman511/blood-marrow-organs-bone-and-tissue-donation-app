namespace Umss.BloodOrgansDonationApp.Models.Requests
{
    public class DonationPostRequest
    {
        public Guid BloodTypeId { get; set; }
        public Guid DonationTypeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public required string Description { get; set; }
        public string? Image { get; set; }
    }
}
