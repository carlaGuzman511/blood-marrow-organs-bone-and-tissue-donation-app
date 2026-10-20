namespace Umss.BloodOrgansDonationApp.Models.Exceptions
{
    /// <summary>The caller is authenticated but not allowed to act on this resource (HTTP 403).</summary>
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message)
            : base(message)
        {
        }
    }
}
