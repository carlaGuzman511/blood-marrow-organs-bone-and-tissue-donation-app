namespace Umss.BloodOrgansDonationApp.Models.Security
{
    /// <summary>
    /// Keycloak realm role names, exactly as they appear in the token's <c>realm_access.roles</c>.
    /// Role claims are lower-cased when the token is validated, so compare against these constants only.
    /// </summary>
    public static class AppRoles
    {
        public const string Donor = "donor";
        public const string ClinicalStaff = "clinical_staff";
        public const string NetworkAdmin = "network_admin";

        /// <summary>
        /// Pre-US-API-12 admin role. Accepted as <see cref="NetworkAdmin"/> until the realm
        /// migration is finished and every admin holds <c>network_admin</c>.
        /// </summary>
        public const string LegacyAdmin = "admin";

        public static string Normalize(string role) => role.Trim().ToLowerInvariant();
    }
}
