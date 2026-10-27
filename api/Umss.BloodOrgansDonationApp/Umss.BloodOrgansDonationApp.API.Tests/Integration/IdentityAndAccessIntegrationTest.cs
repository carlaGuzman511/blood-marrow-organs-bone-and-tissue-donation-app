using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.API.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.API.Tests.Integration
{
    /// <summary>
    /// US-API-12 increment 1: the API knows who is calling (Keycloak sub -> local profile) and stops
    /// trusting user ids from the route or body. Each test creates its own users, so tests are independent.
    /// </summary>
    public class IdentityAndAccessIntegrationTest : IClassFixture<ApiFactory>
    {
        private static readonly TestIdentity NetworkAdmin = TestIdentity.WithRoles("network_admin");

        private readonly ApiFactory _factory;
        private readonly HttpClient _client;

        public IdentityAndAccessIntegrationTest(ApiFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private Task<HttpResponseMessage> Send(TestIdentity who, HttpMethod method, string url, object? body = null) =>
            _client.SendAs(who, method, url, body);

        /// <summary>A donor whose Keycloak account is already linked to a fresh local profile.</summary>
        private async Task<(TestIdentity Identity, User Profile)> LinkedDonorAsync()
        {
            TestIdentity identity = TestIdentity.Donor();
            User profile = await _factory.AddUserAsync(identity.Email, keycloakSubject: identity.Subject);
            return (identity, profile);
        }

        private async Task<object> ValidProfileBodyAsync(string fullName = "Maria Lopez") => new
        {
            fullName,
            bloodTypeId = (await _factory.AddBloodTypeAsync()).Id,
            address = "Av. Siempre Viva 123",
            city = "Cochabamba",
            dateOfBirth = "1995-06-15",
            phoneNumber = "+59171234567",
            image = "maria.png",
            latitude = -17.39,
            longitude = -66.15,
        };

        // ---------- Secure by default ----------

        [Theory(DisplayName = "Without a token every protected endpoint is 401")]
        [InlineData("GET", "/api/blood-types")]
        [InlineData("GET", "/api/users")]
        [InlineData("GET", "/api/me")]
        [InlineData("GET", "/api/donation-posts")]
        public async Task Anonymous_Returns401(string method, string url)
        {
            HttpResponseMessage response = await Send(TestIdentity.Anonymous, new HttpMethod(method), url);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact(DisplayName = "Endpoints marked [AllowAnonymous] stay reachable without a token")]
        public async Task Register_IsAnonymous()
        {
            HttpResponseMessage response = await Send(TestIdentity.Anonymous, HttpMethod.Post, "/api/users/register", new { });

            Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact(DisplayName = "Swagger stays public and documents the Bearer scheme, /api/me and the deprecated endpoints")]
        public async Task Swagger_DocumentsSecurity()
        {
            HttpResponseMessage response = await Send(TestIdentity.Anonymous, HttpMethod.Get, "/swagger/v1/swagger.json");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            using System.Text.Json.JsonDocument doc = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            System.Text.Json.JsonElement root = doc.RootElement;
            Assert.Equal("bearer", root.GetProperty("components").GetProperty("securitySchemes").GetProperty("Bearer").GetProperty("scheme").GetString());
            Assert.True(root.GetProperty("paths").TryGetProperty("/api/me", out _));
            Assert.True(root.GetProperty("paths").GetProperty("/api/users/login").GetProperty("post").GetProperty("deprecated").GetBoolean());
            Assert.True(root.GetProperty("paths").GetProperty("/api/users/register").GetProperty("post").GetProperty("deprecated").GetBoolean());
        }

        // ---------- Admin-only user data ----------

        [Fact(DisplayName = "A donor cannot list all users (403)")]
        public async Task Donor_ListUsers_Returns403()
        {
            HttpResponseMessage response = await Send(TestIdentity.Donor(), HttpMethod.Get, "/api/users");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Theory(DisplayName = "network_admin and the legacy admin role can list users")]
        [InlineData("network_admin")]
        [InlineData("admin")]
        public async Task Admin_ListUsers_Returns200(string role)
        {
            HttpResponseMessage response = await Send(TestIdentity.WithRoles(role), HttpMethod.Get, "/api/users");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact(DisplayName = "A donor cannot delete a user (403) and the user remains")]
        public async Task Donor_DeleteUser_Returns403()
        {
            User victim = await _factory.AddUserAsync();

            HttpResponseMessage response = await Send(TestIdentity.Donor(), HttpMethod.Delete, $"/api/users/{victim.Id}");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.True(await _factory.QueryDbAsync(db => db.Users.AnyAsync(u => u.Id == victim.Id)));
        }

        [Fact(DisplayName = "GET /api/users/{id}: yourself 200, another user's profile 403, admin 200")]
        public async Task GetUserById_SelfOrAdminOnly()
        {
            (TestIdentity me, User myProfile) = await LinkedDonorAsync();
            User other = await _factory.AddUserAsync();

            Assert.Equal(HttpStatusCode.OK, (await Send(me, HttpMethod.Get, $"/api/users/{myProfile.Id}")).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Send(me, HttpMethod.Get, $"/api/users/{other.Id}")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await Send(NetworkAdmin, HttpMethod.Get, $"/api/users/{other.Id}")).StatusCode);
        }

        [Fact(DisplayName = "PUT /api/users/{id} on someone else's profile is 403 and changes nothing")]
        public async Task UpdateOtherUser_Returns403()
        {
            (TestIdentity me, _) = await LinkedDonorAsync();
            User other = await _factory.AddUserAsync();

            HttpResponseMessage response = await Send(me, HttpMethod.Put, $"/api/users/{other.Id}", new
            {
                fullName = "Hacked",
                email = "x@example.com",
                bloodTypeId = other.BloodTypeId,
                password = "Passw0rd!",
                address = "x",
                dateOfBirth = "1990-01-01",
                phoneNumber = "1",
                image = "x",
                latitude = 1.0,
                longitude = 1.0,
            });

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            string? name = await _factory.QueryDbAsync(db => db.Users.Where(u => u.Id == other.Id).Select(u => u.FullName).SingleAsync());
            Assert.Equal("Test User", name);
        }

        [Fact(DisplayName = "User responses never contain a password field")]
        public async Task UserResponse_HasNoPassword()
        {
            (TestIdentity me, User profile) = await LinkedDonorAsync();

            string json = await (await Send(me, HttpMethod.Get, $"/api/users/{profile.Id}")).Content.ReadAsStringAsync();

            Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        }

        // ---------- /api/donors (public donor directory) ----------

        [Fact(DisplayName = "Any signed-in donor can search donors, and only public fields are returned")]
        public async Task Donors_PublicFieldsOnly()
        {
            User donor = await _factory.AddUserAsync();

            HttpResponseMessage list = await Send(TestIdentity.Donor(), HttpMethod.Get, "/api/donors");
            HttpResponseMessage one = await Send(TestIdentity.Donor(), HttpMethod.Get, $"/api/donors/{donor.Id}");

            Assert.Equal(HttpStatusCode.OK, list.StatusCode);
            Assert.Equal(HttpStatusCode.OK, one.StatusCode);
            foreach (string json in new[] { await list.Content.ReadAsStringAsync(), await one.Content.ReadAsStringAsync() })
            {
                foreach (string field in new[] { "address", "phoneNumber", "email", "dateOfBirth", "latitude", "longitude", "password", "keycloakSubject" })
                {
                    Assert.DoesNotContain($"\"{field}\"", json, StringComparison.OrdinalIgnoreCase);
                }
            }

            DonorResponse? body = await one.Content.ReadFromJsonAsync<DonorResponse>();
            Assert.Equal("Test User", body!.FullName);
            Assert.Equal("O+", body.BloodType?.Name);
            Assert.Equal("Cochabamba", body.City);
        }

        [Fact(DisplayName = "Donor search can filter by blood type; an unknown donor is 404; no token is 401")]
        public async Task Donors_FilterAndErrors()
        {
            User donor = await _factory.AddUserAsync();

            PagedResult<DonorResponse>? filtered = await (await Send(TestIdentity.Donor(), HttpMethod.Get, $"/api/donors?bloodTypeId={donor.BloodTypeId}"))
                .Content.ReadFromJsonAsync<PagedResult<DonorResponse>>();

            Assert.Equal(donor.Id, Assert.Single(filtered!.Items).Id);
            Assert.Equal(1, filtered.TotalCount);
            Assert.Equal(HttpStatusCode.NotFound, (await Send(TestIdentity.Donor(), HttpMethod.Get, $"/api/donors/{Guid.NewGuid()}")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await Send(TestIdentity.Anonymous, HttpMethod.Get, "/api/donors")).StatusCode);
        }

        // ---------- /api/me ----------

        [Fact(DisplayName = "/api/me: no profile 404 -> POST 201 (email from the token) -> GET 200 -> PUT 200 -> POST again 409")]
        public async Task Me_FullLifecycle()
        {
            TestIdentity donor = TestIdentity.Donor();

            Assert.Equal(HttpStatusCode.NotFound, (await Send(donor, HttpMethod.Get, "/api/me")).StatusCode);

            HttpResponseMessage created = await Send(donor, HttpMethod.Post, "/api/me", await ValidProfileBodyAsync());
            Assert.Equal(HttpStatusCode.Created, created.StatusCode);
            UserResponse? createdBody = await created.Content.ReadFromJsonAsync<UserResponse>();
            Assert.Equal(donor.Email, createdBody!.Email);
            Assert.Equal("Cochabamba", createdBody.City);
            Assert.EndsWith("/api/me", created.Headers.Location!.ToString());

            UserResponse? fetched = await (await Send(donor, HttpMethod.Get, "/api/me")).Content.ReadFromJsonAsync<UserResponse>();
            Assert.Equal(createdBody.Id, fetched!.Id);

            HttpResponseMessage updated = await Send(donor, HttpMethod.Put, "/api/me", await ValidProfileBodyAsync("Maria L. Updated"));
            Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
            Assert.Equal("Maria L. Updated", (await updated.Content.ReadFromJsonAsync<UserResponse>())!.FullName);

            Assert.Equal(HttpStatusCode.Conflict, (await Send(donor, HttpMethod.Post, "/api/me", await ValidProfileBodyAsync())).StatusCode);

            string? subject = await _factory.QueryDbAsync(db => db.Users.Where(u => u.Id == createdBody.Id).Select(u => u.KeycloakSubject).SingleAsync());
            Assert.Equal(donor.Subject, subject);
        }

        [Fact(DisplayName = "POST /api/me with invalid data is a 400 with the field errors")]
        public async Task Me_InvalidBody_Returns400()
        {
            HttpResponseMessage response = await Send(TestIdentity.Donor(), HttpMethod.Post, "/api/me", new
            {
                fullName = "",
                bloodTypeId = Guid.Empty,
                address = "x",
                dateOfBirth = DateTime.UtcNow.AddYears(1),
                phoneNumber = "1",
                image = "x",
                latitude = 200.0,
                longitude = 0.0,
            });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            ValidationProblemDetails? problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
            Assert.Contains("FullName", problem!.Errors.Keys);
            Assert.Contains("DateOfBirth", problem.Errors.Keys);
            Assert.Contains("Latitude", problem.Errors.Keys);
        }

        [Fact(DisplayName = "PUT /api/me without a profile is 404")]
        public async Task Me_UpdateWithoutProfile_Returns404()
        {
            HttpResponseMessage response = await Send(TestIdentity.Donor(), HttpMethod.Put, "/api/me", await ValidProfileBodyAsync());

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        // ---------- Linking legacy profiles ----------

        [Fact(DisplayName = "A verified email links the Keycloak user to its existing profile")]
        public async Task VerifiedEmail_LinksLegacyProfile()
        {
            User legacy = await _factory.AddUserAsync();
            TestIdentity donor = TestIdentity.Donor(legacy.Email, emailVerified: true);

            HttpResponseMessage response = await Send(donor, HttpMethod.Get, "/api/me");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(legacy.Id, (await response.Content.ReadFromJsonAsync<UserResponse>())!.Id);
        }

        [Fact(DisplayName = "An unverified email never links, and can't be used to create a second profile")]
        public async Task UnverifiedEmail_DoesNotLink()
        {
            User legacy = await _factory.AddUserAsync();
            TestIdentity impostor = TestIdentity.Donor(legacy.Email, emailVerified: false);

            Assert.Equal(HttpStatusCode.NotFound, (await Send(impostor, HttpMethod.Get, "/api/me")).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await Send(impostor, HttpMethod.Post, "/api/me", await ValidProfileBodyAsync())).StatusCode);
            Assert.Null(await _factory.QueryDbAsync(db => db.Users.Where(u => u.Id == legacy.Id).Select(u => u.KeycloakSubject).SingleAsync()));
        }

        [Fact(DisplayName = "A profile already linked to one Keycloak user is never re-linked to another")]
        public async Task LinkedProfile_IsNotRelinked()
        {
            (TestIdentity owner, User profile) = await LinkedDonorAsync();
            TestIdentity secondAccount = TestIdentity.Donor(owner.Email, emailVerified: true);

            HttpResponseMessage response = await Send(secondAccount, HttpMethod.Get, "/api/me");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Equal(owner.Subject, await _factory.QueryDbAsync(db => db.Users.Where(u => u.Id == profile.Id).Select(u => u.KeycloakSubject).SingleAsync()));
        }

        // ---------- users/{userId}/donation-posts ----------

        [Fact(DisplayName = "Posting under another user's id is 403; under your own id it works")]
        public async Task CreatePostForAnotherUser_Returns403()
        {
            (TestIdentity me, User myProfile) = await LinkedDonorAsync();
            User victim = await _factory.AddUserAsync();
            object body = new
            {
                bloodTypeId = (await _factory.AddBloodTypeAsync()).Id,
                donationTypeId = (await _factory.AddDonationTypeAsync()).Id,
                title = "Necesito O+",
                description = "Urgente",
                image = "post.png",
            };

            HttpResponseMessage forged = await Send(me, HttpMethod.Post, $"/api/users/{victim.Id}/donation-posts", body);
            HttpResponseMessage own = await Send(me, HttpMethod.Post, $"/api/users/{myProfile.Id}/donation-posts", body);

            Assert.Equal(HttpStatusCode.Forbidden, forged.StatusCode);
            Assert.Equal(HttpStatusCode.Created, own.StatusCode);
            Assert.False(await _factory.QueryDbAsync(db => db.DonationPosts.AnyAsync(p => p.UserId == victim.Id)));
        }

        [Fact(DisplayName = "Deleting another user's post is 403 and the post remains")]
        public async Task DeleteOthersPost_Returns403()
        {
            (TestIdentity me, _) = await LinkedDonorAsync();
            User victim = await _factory.AddUserAsync();
            DonationPost post = await _factory.AddPostAsync(victim.Id);

            HttpResponseMessage response = await Send(me, HttpMethod.Delete, $"/api/users/{victim.Id}/donation-posts/{post.Id}");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.True(await _factory.QueryDbAsync(db => db.DonationPosts.AnyAsync(p => p.Id == post.Id)));
        }

        // ---------- Comments ----------

        [Fact(DisplayName = "A comment's author is the caller, whatever UserId the body claims")]
        public async Task CreateComment_AuthorFromToken()
        {
            (TestIdentity me, User myProfile) = await LinkedDonorAsync();
            User victim = await _factory.AddUserAsync();
            DonationPost post = await _factory.AddPostAsync(victim.Id);

            HttpResponseMessage response = await Send(me, HttpMethod.Post, $"/api/posts/{post.Id}/comments", new { description = "Yo dono", userId = victim.Id });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Guid author = await _factory.QueryDbAsync(db => db.Comments.Where(c => c.DonationPostId == post.Id).Select(c => c.UserId).SingleAsync());
            Assert.Equal(myProfile.Id, author);
        }

        [Fact(DisplayName = "Commenting without a profile is 403 (complete your profile first)")]
        public async Task CreateComment_WithoutProfile_Returns403()
        {
            User author = await _factory.AddUserAsync();
            DonationPost post = await _factory.AddPostAsync(author.Id);

            HttpResponseMessage response = await Send(TestIdentity.Donor(), HttpMethod.Post, $"/api/posts/{post.Id}/comments", new { description = "Hola" });

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact(DisplayName = "Only the comment's author (or an admin) can edit or delete it")]
        public async Task EditDeleteComment_AuthorOrAdminOnly()
        {
            (TestIdentity author, User authorProfile) = await LinkedDonorAsync();
            (TestIdentity stranger, _) = await LinkedDonorAsync();
            DonationPost post = await _factory.AddPostAsync(authorProfile.Id);
            Comment comment = await _factory.AddCommentAsync(post.Id, authorProfile.Id);
            string url = $"/api/posts/{post.Id}/comments/{comment.Id}";

            Assert.Equal(HttpStatusCode.Forbidden, (await Send(stranger, HttpMethod.Put, url, new { description = "editado" })).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Send(stranger, HttpMethod.Delete, url)).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await Send(author, HttpMethod.Put, url, new { description = "editado por mi" })).StatusCode);
            Assert.Equal(HttpStatusCode.NoContent, (await Send(NetworkAdmin, HttpMethod.Delete, url)).StatusCode);
        }
    }
}
