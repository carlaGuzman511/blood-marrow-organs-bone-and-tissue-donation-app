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

        public static void Configure(AuthorizationOptions options)
        {
            // Secure by default: an endpoint someone forgets to annotate is still not public.
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(NetworkAdmin, policy => policy
                .RequireAuthenticatedUser()
                .RequireRole(AppRoles.NetworkAdmin, AppRoles.LegacyAdmin));
        }
    }
}
