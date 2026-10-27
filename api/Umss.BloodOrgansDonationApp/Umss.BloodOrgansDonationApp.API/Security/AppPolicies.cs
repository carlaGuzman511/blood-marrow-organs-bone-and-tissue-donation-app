using Microsoft.AspNetCore.Authorization;
using Umss.BloodOrgansDonationApp.Models.Security;

namespace Umss.BloodOrgansDonationApp.API.Security
{
    /// <summary>
    /// Named authorization policies. Use <c>[Authorize(Policy = AppPolicies.X)]</c>, never
    /// <c>[Authorize(Roles = "...")]</c>: role names live in <see cref="AppRoles"/> only.
    /// Every endpoint requires a signed-in user unless it is marked <c>[AllowAnonymous]</c> (fallback policy).
    /// </summary>
    public static class AppPolicies
    {
        public const string NetworkAdmin = nameof(NetworkAdmin);

        /// <summary>Hospital or blood bank personnel (clinical_staff), or a network admin.</summary>
        public const string ClinicalStaff = nameof(ClinicalStaff);

        public static void Configure(AuthorizationOptions options)
        {
            // Secure by default: an endpoint someone forgets to annotate is still not public.
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(NetworkAdmin, policy => policy
                .RequireAuthenticatedUser()
                .RequireRole(AppRoles.NetworkAdmin, AppRoles.LegacyAdmin));

            options.AddPolicy(ClinicalStaff, policy => policy
                .RequireAuthenticatedUser()
                .RequireRole(AppRoles.ClinicalStaff, AppRoles.NetworkAdmin, AppRoles.LegacyAdmin));
        }
    }
}
