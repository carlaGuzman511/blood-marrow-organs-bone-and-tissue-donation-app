using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Umss.BloodOrgansDonationApp.Models.Security;

namespace Umss.BloodOrgansDonationApp.API.Security
{
    /// <summary>
    /// Makes Keycloak roles usable by <c>[Authorize]</c> policies:
    /// <list type="bullet">
    /// <item>projects <c>realm_access.roles</c> (a JSON claim ASP.NET doesn't understand) onto <see cref="ClaimTypes.Role"/>;</item>
    /// <item>lower-cases every role, so "Admin" and "admin" are the same role (role checks are case-sensitive).</item>
    /// </list>
    /// Runs after authentication for any scheme, so tests get the same behaviour as real tokens.
    /// </summary>
    public class KeycloakClaimsTransformation : IClaimsTransformation
    {
        // ASP.NET may call TransformAsync more than once per request; this marks an already-transformed principal.
        private const string TransformedClaim = "urn:donavida:roles-normalized";

        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (principal.Identity is not ClaimsIdentity { IsAuthenticated: true } source || principal.HasClaim(c => c.Type == TransformedClaim))
            {
                return Task.FromResult(principal);
            }

            HashSet<string> roles = source.FindAll(source.RoleClaimType)
                .Select(c => c.Value)
                .Concat(ReadRealmRoles(source.FindFirst("realm_access")?.Value))
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(AppRoles.Normalize)
                .ToHashSet();

            // Work on a copy: the original principal may be cached by the authentication handler.
            ClaimsIdentity identity = new ClaimsIdentity(
                source.Claims.Where(c => c.Type != source.RoleClaimType),
                source.AuthenticationType,
                source.NameClaimType,
                ClaimTypes.Role);

            identity.AddClaims(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            identity.AddClaim(new Claim(TransformedClaim, "true"));

            return Task.FromResult(new ClaimsPrincipal(identity));
        }

        internal static IEnumerable<string> ReadRealmRoles(string? realmAccess)
        {
            if (string.IsNullOrWhiteSpace(realmAccess))
            {
                return Array.Empty<string>();
            }

            try
            {
                using JsonDocument document = JsonDocument.Parse(realmAccess);
                if (document.RootElement.ValueKind != JsonValueKind.Object
                    || !document.RootElement.TryGetProperty("roles", out JsonElement roles)
                    || roles.ValueKind != JsonValueKind.Array)
                {
                    return Array.Empty<string>();
                }

                return roles.EnumerateArray()
                    .Where(r => r.ValueKind == JsonValueKind.String)
                    .Select(r => r.GetString()!)
                    .ToList();
            }
            catch (JsonException)
            {
                // A malformed claim grants no roles; it must never fail the request.
                return Array.Empty<string>();
            }
        }
    }
}
