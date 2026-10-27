using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.API.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.API.Tests.Integration
{
    /// <summary>
    /// US-API-01 / US-API-02 through the real pipeline: JSON with enums as text, the status codes
    /// of the acceptance criteria (201, 400, 401, 403, 404, 409), server-side filters, the
    /// ClinicalStaff policy, the history and the old feed still working.
    /// Each test uses its own center, so counts don't see other tests' rows.
    /// </summary>
    public class DonationRequestIntegrationTest : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;
        private readonly HttpClient _client;

        public DonationRequestIntegrationTest(ApiFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private static readonly TestIdentity Staff = TestIdentity.WithRoles("clinical_staff");

        private sealed record World(Guid BloodO, Guid BloodA, Guid DonationType, Guid Center);

        private async Task<World> NewWorldAsync()
        {
            BloodType o = await _factory.AddBloodTypeAsync();
            BloodType a = await _factory.AddBloodTypeAsync();
            DonationType type = await _factory.AddDonationTypeAsync();
            DonationCenter center = await _factory.AddCenterAsync();
            return new World(o.Id, a.Id, type.Id, center.Id);
        }

        private static object Body(World w, string urgency = "CodeRed", int units = 4, DateTime? deadline = null, Guid? bloodType = null, string component = "PlateletsApheresis") => new
        {
            title = "Paciente #PX-4912 necesita plaquetas",
            description = "Trauma shock",
            bloodTypeId = bloodType ?? w.BloodO,
            donationTypeId = w.DonationType,
            donationCenterId = w.Center,
            component,
            urgency,
            unitsRequired = units,
            deadline = deadline ?? DateTime.UtcNow.AddMinutes(35),
            patientCode = "PX-4912",
            service = "Quirofano Central 3",
            bed = "UCI-04",
            coordinationPhone = "+591 70000000",
        };

        private async Task<JsonElement> CreateAsync(World w, TestIdentity? as_ = null, object? body = null)
        {
            HttpResponseMessage response = await _client.SendAs(as_ ?? Staff, HttpMethod.Post, "/api/donation-requests", body ?? Body(w));
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            return await response.Content.ReadFromJsonAsync<JsonElement>();
        }

        private static async Task<JsonElement> Json(HttpResponseMessage response) => await response.Content.ReadFromJsonAsync<JsonElement>();

        [Fact]
        public async Task Post_ByADonorWithProfile_Is201_WithZeroUnitsAndEnumsAsText()
        {
            World w = await NewWorldAsync();
            TestIdentity donor = TestIdentity.Donor();
            User profile = await _factory.AddUserAsync(keycloakSubject: donor.Subject);

            HttpResponseMessage response = await _client.SendAs(donor, HttpMethod.Post, "/api/donation-requests", Body(w));

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            JsonElement created = await Json(response);
            Assert.Equal($"/api/donation-requests/{created.GetProperty("id").GetString()}", response.Headers.Location!.AbsolutePath);
            Assert.Equal(0, created.GetProperty("unitsCovered").GetInt32());
            Assert.Equal(4, created.GetProperty("unitsRequired").GetInt32());
            Assert.Equal("SearchingDonors", created.GetProperty("status").GetString());
            Assert.Equal("CodeRed", created.GetProperty("urgency").GetString());
            Assert.Equal("PlateletsApheresis", created.GetProperty("component").GetString());
            Assert.StartsWith("REQ-", created.GetProperty("code").GetString());
            Assert.Equal(profile.Id.ToString(), created.GetProperty("author").GetProperty("id").GetString());
            Assert.Equal("UCI-04", created.GetProperty("patient").GetProperty("bed").GetString());

            // The first history entry is written with the request.
            Guid id = created.GetProperty("id").GetGuid();
            int history = await _factory.QueryDbAsync(db => db.DonationRequestStatusChanges.CountAsync(c => c.DonationPostId == id));
            Assert.Equal(1, history);
        }

        [Theory]
        [InlineData(0, 30, "unitsRequired")]
        [InlineData(-1, 30, "unitsRequired")]
        [InlineData(2, -30, "deadline")]
        public async Task Post_WithNoUnitsOrAPastDeadline_Is400_WithTheFieldInErrors(int units, int minutesFromNow, string field)
        {
            World w = await NewWorldAsync();

            HttpResponseMessage response = await _client.SendAs(Staff, HttpMethod.Post, "/api/donation-requests",
                Body(w, units: units, deadline: DateTime.UtcNow.AddMinutes(minutesFromNow)));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            JsonElement errors = (await Json(response)).GetProperty("errors");
            Assert.Contains(errors.EnumerateObject(), e => e.Name.Equals(field, StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public async Task Post_WithAnUnknownUrgency_Is400()
        {
            World w = await NewWorldAsync();
            HttpResponseMessage response = await _client.SendAs(Staff, HttpMethod.Post, "/api/donation-requests", Body(w, urgency: "Rojo"));
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Post_Anonymous_Is401_AndDonorWithoutProfile_Is403()
        {
            World w = await NewWorldAsync();

            HttpResponseMessage anonymous = await _client.SendAs(TestIdentity.Anonymous, HttpMethod.Post, "/api/donation-requests", Body(w));
            Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);

            HttpResponseMessage noProfile = await _client.SendAs(TestIdentity.Donor(), HttpMethod.Post, "/api/donation-requests", Body(w));
            Assert.Equal(HttpStatusCode.Forbidden, noProfile.StatusCode);
        }

        [Fact]
        public async Task Get_FiltersOnTheServer_WithSeveralBloodTypes_AndHidesPatientDataFromDonors()
        {
            World w = await NewWorldAsync();
            await CreateAsync(w, body: Body(w, urgency: "CodeRed", bloodType: w.BloodO));
            await CreateAsync(w, body: Body(w, urgency: "CodeRed", bloodType: w.BloodA));
            await CreateAsync(w, body: Body(w, urgency: "Priority", bloodType: w.BloodO, deadline: DateTime.UtcNow.AddHours(18)));
            await CreateAsync(w, body: Body(w, urgency: "CodeRed", bloodType: w.BloodO, component: "WholeBlood"));

            string url = $"/api/donation-requests?donationCenterId={w.Center}&urgency=CodeRed&component=PlateletsApheresis" +
                         $"&bloodTypeId={w.BloodO}&bloodTypeId={w.BloodA}&status=SearchingDonors&open=true";
            JsonElement staffPage = await Json(await _client.SendAs(Staff, HttpMethod.Get, url));
            Assert.Equal(2, staffPage.GetProperty("totalCount").GetInt32());
            Assert.All(staffPage.GetProperty("items").EnumerateArray(), r => Assert.Equal(JsonValueKind.Object, r.GetProperty("patient").ValueKind));

            JsonElement donorPage = await Json(await _client.SendAs(TestIdentity.Donor(), HttpMethod.Get, url));
            Assert.Equal(2, donorPage.GetProperty("totalCount").GetInt32());
            Assert.All(donorPage.GetProperty("items").EnumerateArray(), r => Assert.Equal(JsonValueKind.Null, r.GetProperty("patient").ValueKind));

            JsonElement all = await Json(await _client.SendAs(Staff, HttpMethod.Get, $"/api/donation-requests?donationCenterId={w.Center}"));
            Assert.Equal(4, all.GetProperty("totalCount").GetInt32());
            Assert.Equal("CodeRed", all.GetProperty("items")[0].GetProperty("urgency").GetString()); // most urgent first
            Assert.Equal("Priority", all.GetProperty("items")[3].GetProperty("urgency").GetString());
        }

        [Fact]
        public async Task Get_WithAnUnknownPhase_Is400()
        {
            HttpResponseMessage response = await _client.SendAs(Staff, HttpMethod.Get, "/api/donation-requests?status=Perdida");
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ReturnsProgressAndCountdown_And404WhenMissing()
        {
            World w = await NewWorldAsync();
            string id = (await CreateAsync(w)).GetProperty("id").GetString()!;
            await _client.SendAs(Staff, HttpMethod.Post, $"/api/donation-requests/{id}/units", new { units = 1 });

            JsonElement request = await Json(await _client.SendAs(TestIdentity.Donor(), HttpMethod.Get, $"/api/donation-requests/{id}"));
            Assert.Equal(1, request.GetProperty("unitsCovered").GetInt32());
            Assert.Equal(25, request.GetProperty("progressPercent").GetInt32());
            long remaining = request.GetProperty("remainingSeconds").GetInt64();
            Assert.InRange(remaining, 30 * 60, 35 * 60);

            HttpResponseMessage missing = await _client.SendAs(Staff, HttpMethod.Get, $"/api/donation-requests/{Guid.NewGuid()}");
            Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        }

        [Fact]
        public async Task PatchStatus_MovesThroughThePhases_AndRejectsInvalidMovesWith409()
        {
            World w = await NewWorldAsync();
            string id = (await CreateAsync(w)).GetProperty("id").GetString()!;
            string url = $"/api/donation-requests/{id}/status";

            JsonElement moved = await Json(await _client.SendAs(Staff, HttpMethod.Patch, url, new { status = "DonorsOnTheWay" }));
            Assert.Equal("DonorsOnTheWay", moved.GetProperty("status").GetString());
            Assert.Equal(JsonValueKind.String, moved.GetProperty("statusChangedAt").ValueKind);
            Assert.Equal(
                new[] { "SearchingDonors", "LabValidation", "Cancelled" },
                moved.GetProperty("allowedNextStatuses").EnumerateArray().Select(s => s.GetString()));

            HttpResponseMessage skip = await _client.SendAs(Staff, HttpMethod.Patch, url, new { status = "Completed" });
            Assert.Equal(HttpStatusCode.Conflict, skip.StatusCode);
            Assert.Contains("No se puede pasar", (await Json(skip)).GetProperty("detail").GetString());

            await _client.SendAs(Staff, HttpMethod.Patch, url, new { status = "Cancelled" });
            HttpResponseMessage reopen = await _client.SendAs(Staff, HttpMethod.Patch, url, new { status = "SearchingDonors" });
            Assert.Equal(HttpStatusCode.Conflict, reopen.StatusCode);

            Guid requestId = Guid.Parse(id);
            List<RequestStatus> history = await _factory.QueryDbAsync(db => db.DonationRequestStatusChanges
                .Where(c => c.DonationPostId == requestId).OrderBy(c => c.ChangedAt).Select(c => c.ToStatus).ToListAsync());
            Assert.Equal(new[] { RequestStatus.SearchingDonors, RequestStatus.DonorsOnTheWay, RequestStatus.Cancelled }, history);
        }

        [Fact]
        public async Task PatchStatus_ByADonor_Is403_AndUnknownRequest_Is404()
        {
            World w = await NewWorldAsync();
            string id = (await CreateAsync(w)).GetProperty("id").GetString()!;

            HttpResponseMessage donor = await _client.SendAs(TestIdentity.Donor(), HttpMethod.Patch, $"/api/donation-requests/{id}/status", new { status = "Cancelled" });
            Assert.Equal(HttpStatusCode.Forbidden, donor.StatusCode);

            HttpResponseMessage missing = await _client.SendAs(Staff, HttpMethod.Patch, $"/api/donation-requests/{Guid.NewGuid()}/status", new { status = "Cancelled" });
            Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        }

        [Fact]
        public async Task PostUnits_ReachingTheGoal_CompletesTheRequest_ThenFurtherUnitsAre409()
        {
            World w = await NewWorldAsync();
            string id = (await CreateAsync(w, body: Body(w, units: 2))).GetProperty("id").GetString()!;
            string url = $"/api/donation-requests/{id}/units";

            JsonElement done = await Json(await _client.SendAs(Staff, HttpMethod.Post, url, new { units = 2 }));
            Assert.Equal("Completed", done.GetProperty("status").GetString());
            Assert.Equal(100, done.GetProperty("progressPercent").GetInt32());
            Assert.Equal(JsonValueKind.Null, done.GetProperty("remainingSeconds").ValueKind);

            HttpResponseMessage more = await _client.SendAs(Staff, HttpMethod.Post, url, new { units = 1 });
            Assert.Equal(HttpStatusCode.Conflict, more.StatusCode);
        }

        [Fact]
        public async Task OldFeed_StillListsTheRequest_WithPriorityAndUrgency()
        {
            World w = await NewWorldAsync();
            string id = (await CreateAsync(w)).GetProperty("id").GetString()!;

            JsonElement feed = await Json(await _client.SendAs(TestIdentity.Donor(), HttpMethod.Get, $"/api/donation-posts?donationCenterId={w.Center}&priority=true"));
            JsonElement post = Assert.Single(feed.GetProperty("items").EnumerateArray());
            Assert.Equal(id, post.GetProperty("id").GetString());
            Assert.True(post.GetProperty("priority").GetBoolean());
            Assert.Equal("CodeRed", post.GetProperty("urgency").GetString());
        }
    }
}
