namespace Umss.BloodOrgansDonationApp.Models.Responses
{
    /// <summary>
    /// Who wrote a post or comment, as any signed-in user sees it: public fields only.
    /// Never add email, phone, address, date of birth or coordinates here.
    /// </summary>
    public class AuthorResponse
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public string? Image { get; set; }
    }
}
