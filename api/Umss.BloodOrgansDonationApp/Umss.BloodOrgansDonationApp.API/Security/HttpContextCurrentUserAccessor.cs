using System.Security.Claims;
using Umss.BloodOrgansDonationApp.Models.Security;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Umss.BloodOrgansDonationApp.Services.Security;

namespace Umss.BloodOrgansDonationApp.API.Security
{
    /// <summary>Builds the <see cref="CallerIdentity"/> from the validated token of the current request.</summary>
    public class HttpContextCurrentUserAccessor : ICurrentUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HttpContextCurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public CallerIdentity? GetCaller()
        {
            ClaimsPrincipal? user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            // Keycloak's user id. JwtBearer keeps it as "sub" (MapInboundClaims = false).
            string? subject = user.FindFirst("sub")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(subject))
            {
                return null;
            }

            string? email = user.FindFirst("email")?.Value ?? user.FindFirst(ClaimTypes.Email)?.Value;
            bool emailVerified = string.Equals(user.FindFirst("email_verified")?.Value, "true", StringComparison.OrdinalIgnoreCase);

            HashSet<string> roles = user.FindAll(ClaimTypes.Role)
                .Select(c => AppRoles.Normalize(c.Value))
                .ToHashSet();

            return new CallerIdentity(subject, email, emailVerified, roles);
        }
    }
}
