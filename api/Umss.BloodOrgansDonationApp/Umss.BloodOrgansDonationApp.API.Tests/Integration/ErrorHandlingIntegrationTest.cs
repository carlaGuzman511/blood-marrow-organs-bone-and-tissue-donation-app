using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Umss.BloodOrgansDonationApp.API.Tests.Utilities;

namespace Umss.BloodOrgansDonationApp.API.Tests.Integration
{
    /// <summary>
    /// US-ARCH-01: controllers no longer catch exceptions; ExceptionMiddleware maps them.
    /// These tests go through the real pipeline to prove every controller still answers
    /// 400/404 instead of a generic 500.
    /// </summary>
    public class ErrorHandlingIntegrationTest : IClassFixture<ApiFactory>
    {
        private readonly HttpClient _client;

        public ErrorHandlingIntegrationTest(ApiFactory factory)
        {
            _client = factory.CreateClient();
        }

        public static TheoryData<string, string, string, string> InvalidRequests => new()
        {
            // method, url, json body, property expected in "errors"
            { "POST", "api/blood-types", """{"name":"","image":""}""", "Name" },
            { "POST", "api/donation-types", """{"name":"","description":"","requirements":"","process":"","importance":"","benefits":"","secondaryEffects":"","image":""}""", "Name" },
            { "POST", "api/donation-centers", """{"name":"","address":"","city":"","latitude":0,"longitude":0,"image":"","email":"","openingHours":"","phone":"","donationTypeIds":[]}""", "Name" },
            { "POST", $"api/users/{Guid.NewGuid()}/donation-posts", """{"title":"","description":"","image":""}""", "Title" },
            { "POST", $"api/donation-centers/{Guid.NewGuid()}/donation-posts", """{"title":"","description":"","image":""}""", "Description" },
            { "POST", $"api/posts/{Guid.NewGuid()}/comments", """{"description":""}""", "Description" },
            { "POST", "api/users/register", """{"fullName":"","email":"","password":"","address":"","phoneNumber":"","image":"","latitude":0,"longitude":0,"bloodTypeId":"00000000-0000-0000-0000-000000000000"}""", "Email" },
        };

        public static TheoryData<string, string> MalformedBodies => new()
        {
            // Missing a C# "required" member: model binding fails before the service runs.
            { "api/users/register", """{"email":"a@b.com"}""" },
            { $"api/users/{Guid.NewGuid()}/donation-posts", """{"title":"t"}""" },
            { "api/donation-centers", """{"name":"x"}""" },
            { "api/donation-types", """{"name":"x"}""" },
        };

        [Theory(DisplayName = "A body that fails model binding is a 400, never a 500")]
        [MemberData(nameof(MalformedBodies))]
        public async Task MalformedBody_Returns400(string url, string body)
        {
            // These controllers used [Controller] instead of [ApiController]: the null body reached
            // the validator and failed with ArgumentNullException -> 500.
            HttpResponseMessage response = await SendAsync("POST", url, body);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            JsonElement problem = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(400, problem.GetProperty("status").GetInt32());
        }

        [Theory(DisplayName = "ValidationException from any controller becomes a 400 ProblemDetails")]
        [MemberData(nameof(InvalidRequests))]
        public async Task ValidationException_Returns400ProblemDetails(string method, string url, string body, string expectedProperty)
        {
            HttpResponseMessage response = await SendAsync(method, url, body);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

            JsonElement problem = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(400, problem.GetProperty("status").GetInt32());
            Assert.True(problem.GetProperty("errors").TryGetProperty(expectedProperty, out JsonElement messages),
                $"Expected a validation error for '{expectedProperty}', got: {problem}");
            Assert.NotEmpty(messages.EnumerateArray());
        }

        public static TheoryData<string, string, string> MissingResources => new()
        {
            { "PUT", $"api/posts/{Guid.NewGuid()}/comments/{Guid.NewGuid()}", """{"description":"editado"}""" },
            { "PUT", $"api/users/{Guid.NewGuid()}/donation-posts/{Guid.NewGuid()}", """{"title":"t","description":"d","image":"i"}""" },
            { "PUT", $"api/donation-centers/{Guid.NewGuid()}/donation-posts/{Guid.NewGuid()}", """{"title":"t","description":"d","image":"i"}""" },
        };

        [Theory(DisplayName = "EntityNotFoundException becomes a 404 ProblemDetails")]
        [MemberData(nameof(MissingResources))]
        public async Task EntityNotFoundException_Returns404ProblemDetails(string method, string url, string body)
        {
            // CommentController used to catch EntryPointNotFoundException (wrong type) and answer 500.
            HttpResponseMessage response = await SendAsync(method, url, body);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

            JsonElement problem = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(404, problem.GetProperty("status").GetInt32());
            Assert.Contains("not found", problem.GetProperty("detail").GetString(), StringComparison.OrdinalIgnoreCase);
        }

        private Task<HttpResponseMessage> SendAsync(string method, string url, string body)
        {
            HttpRequestMessage request = new HttpRequestMessage(new HttpMethod(method), url)
            {
                Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json"),
            };
            return _client.SendAsync(request);
        }
    }
}
