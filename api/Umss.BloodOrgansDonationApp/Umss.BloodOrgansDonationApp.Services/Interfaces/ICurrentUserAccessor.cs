using Umss.BloodOrgansDonationApp.Services.Security;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    /// <summary>Reads the caller from the current request. Implemented by the API layer.</summary>
    public interface ICurrentUserAccessor
    {
        /// <summary>The authenticated caller, or null for an anonymous request.</summary>
        CallerIdentity? GetCaller();
    }
}
