using System.Security.Claims;
using Umss.BloodOrgansDonationApp.API.Security;

namespace Umss.BloodOrgansDonationApp.API.Tests.Security
{
    public class KeycloakClaimsTransformationTest
    {
        private readonly KeycloakClaimsTransformation _transformation = new KeycloakClaimsTransformation();

        private static ClaimsPrincipal Principal(params Claim[] claims) =>
            new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer", "preferred_username", ClaimTypes.Role));

        private static string[] Roles(ClaimsPrincipal principal) =>
            principal.FindAll(ClaimTypes.Role).Select(c => c.Value).OrderBy(r => r).ToArray();

        [Fact(DisplayName = "realm_access roles become lower-cased role claims")]
        public async Task ProjectsRealmRoles()
        {
            ClaimsPrincipal result = await _transformation.TransformAsync(
                Principal(new Claim("realm_access", "{\"roles\":[\"Network_Admin\",\"donor\",\"offline_access\"]}")));

            Assert.Equal(new[] { "donor", "network_admin", "offline_access" }, Roles(result));
            Assert.True(result.IsInRole("network_admin"));
        }

        [Fact(DisplayName = "Existing role claims are lower-cased and de-duplicated")]
        public async Task NormalizesExistingRoles()
        {
            ClaimsPrincipal result = await _transformation.TransformAsync(Principal(
                new Claim(ClaimTypes.Role, "Admin"),
                new Claim("realm_access", "{\"roles\":[\"admin\"]}")));

            Assert.Equal(new[] { "admin" }, Roles(result));
        }

        [Theory(DisplayName = "A malformed or missing realm_access grants no roles and never throws")]
        [InlineData("not json")]
        [InlineData("[\"admin\"]")]
        [InlineData("{\"roles\":\"admin\"}")]
        [InlineData("{\"roles\":[1,null]}")]
        [InlineData("{}")]
        public async Task MalformedRealmAccess_NoRoles(string realmAccess)
        {
            ClaimsPrincipal result = await _transformation.TransformAsync(Principal(new Claim("realm_access", realmAccess)));

            Assert.Empty(Roles(result));
        }

        [Fact(DisplayName = "Running twice gives the same roles (ASP.NET may call it more than once)")]
        public async Task Idempotent()
        {
            ClaimsPrincipal once = await _transformation.TransformAsync(Principal(new Claim("realm_access", "{\"roles\":[\"Donor\"]}")));
            ClaimsPrincipal twice = await _transformation.TransformAsync(once);

            Assert.Equal(new[] { "donor" }, Roles(twice));
        }

        [Fact(DisplayName = "An unauthenticated principal is left untouched")]
        public async Task Anonymous_Untouched()
        {
            ClaimsPrincipal anonymous = new ClaimsPrincipal(new ClaimsIdentity());

            Assert.Same(anonymous, await _transformation.TransformAsync(anonymous));
        }

        [Fact(DisplayName = "Other claims (sub, email) are kept")]
        public async Task KeepsOtherClaims()
        {
            ClaimsPrincipal result = await _transformation.TransformAsync(Principal(new Claim("sub", "abc"), new Claim("email", "a@b.com")));

            Assert.Equal("abc", result.FindFirst("sub")?.Value);
            Assert.Equal("a@b.com", result.FindFirst("email")?.Value);
        }
    }
}
