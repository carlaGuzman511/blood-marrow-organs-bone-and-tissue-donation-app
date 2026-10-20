namespace Umss.BloodOrgansDonationApp.Models.Exceptions
{
    /// <summary>The request conflicts with the current state of the resource (HTTP 409).</summary>
    public class ConflictException : Exception
    {
        public ConflictException(string message)
            : base(message)
        {
        }
    }
}
