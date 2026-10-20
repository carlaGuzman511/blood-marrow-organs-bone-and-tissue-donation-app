using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.API.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.API.Tests.Integration
{
    /// <summary>
    /// End-to-end through the real JwtBearer setup in Program.cs, with Keycloak-shaped tokens.
    /// Guards the production wiring: status codes (not cookie redirects), role casing, claim names.
    /// </summary>
    public class JwtPipelineIntegrationTest : IClassFixture<JwtApiFactory>
    {
        private readonly JwtApiFactory _factory;
        private readonly HttpClient _client;

        public JwtPipelineIntegrationTest(JwtApiFactory factory)
        {
            _factory = factory;
            // Never follow redirects: a 302 must show up as a failure, not be hidden behind its target.
            _client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        }

        private Task<HttpResponseMessage> GetAsync(string url, string? token)
        {
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, url);
            if (token != null)
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            return _client.SendAsync(request);
        }

        [Fact(DisplayName = "No token is a 401, not a redirect to a login page")]
        public async Task NoToken_Returns401()
        {
            HttpResponseMessage response = await GetAsync("/api/blood-types", token: null);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact(DisplayName = "A token signed with another key is a 401")]
        public async Task ForgedToken_Returns401()
        {
            string token = JwtApiFactory.CreateToken("someone", new[] { "network_admin" });
            string forged = token[..^4] + (token.EndsWith("AAAA") ? "BBBB" : "AAAA");

            HttpResponseMessage response = await GetAsync("/api/users", forged);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        // ASP.NET Identity is registered too; its cookie scheme must never answer API requests with a redirect.
        [Fact(DisplayName = "A donor on an admin endpoint gets 403, not a cookie redirect (302)")]
        public async Task Donor_OnAdminEndpoint_Returns403()
        {
            string token = JwtApiFactory.CreateToken(Guid.NewGuid().ToString(), new[] { "donor" });

            HttpResponseMessage response = await GetAsync("/api/users", token);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Theory(DisplayName = "Admin roles match whatever their casing in Keycloak")]
        [InlineData("network_admin")]
        [InlineData("admin")]
        [InlineData("Admin")]
        [InlineData("NETWORK_ADMIN")]
        public async Task AdminRoles_AnyCasing_Return200(string realmRole)
        {
            string token = JwtApiFactory.CreateToken(Guid.NewGuid().ToString(), new[] { realmRole });

            HttpResponseMessage response = await GetAsync("/api/users", token);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact(DisplayName = "The token's sub and verified email link the caller to their existing profile")]
        public async Task VerifiedEmail_LinksExistingProfile()
        {
            string email = $"legacy-{Guid.NewGuid():N}@example.com";
            Guid expectedId = (await _factory.AddUserAsync(email)).Id;
            string subject = Guid.NewGuid().ToString();
            // Different casing than stored: email matching must be case-insensitive.
            string token = JwtApiFactory.CreateToken(subject, new[] { "donor" }, email.ToUpperInvariant(), emailVerified: true);

            HttpResponseMessage response = await GetAsync("/api/me", token);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            UserResponse? me = await response.Content.ReadFromJsonAsync<UserResponse>();
            Assert.Equal(expectedId, me!.Id);
            string? linked = await _factory.QueryDbAsync(db => db.Users.Where(u => u.Id == expectedId).Select(u => u.KeycloakSubject).SingleAsync());
            Assert.Equal(subject, linked);
        }
    }
}
