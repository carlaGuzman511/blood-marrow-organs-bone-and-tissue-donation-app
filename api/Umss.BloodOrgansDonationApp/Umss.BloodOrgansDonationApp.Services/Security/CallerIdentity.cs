using Umss.BloodOrgansDonationApp.Models.Security;

namespace Umss.BloodOrgansDonationApp.Services.Security
{
    /// <summary>
    /// Who is calling, as stated by the validated Keycloak token. Nothing here comes from the
    /// route or the body. <paramref name="Roles"/> are already lower-cased (see <see cref="AppRoles"/>).
    /// </summary>
    public sealed record CallerIdentity(string Subject, string? Email, bool EmailVerified, IReadOnlySet<string> Roles)
    {
        public bool IsInRole(string role) => Roles.Contains(AppRoles.Normalize(role));

        public bool IsNetworkAdmin => IsInRole(AppRoles.NetworkAdmin) || IsInRole(AppRoles.LegacyAdmin);
    }
}
