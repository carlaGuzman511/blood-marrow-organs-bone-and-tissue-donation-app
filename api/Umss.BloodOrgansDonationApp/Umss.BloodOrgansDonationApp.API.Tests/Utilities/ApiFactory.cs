using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.API.Tests.Utilities
{
    /// <summary>
    /// Boots the real API pipeline (middleware, routing, controllers, services, repositories)
    /// in memory. Postgres is replaced by EF Core InMemory and Keycloak JWT auth by
    /// <see cref="TestAuthHandler"/>, which authenticates every request.
    /// </summary>
    public class ApiFactory : WebApplicationFactory<Program>
    {
        private readonly string _databaseName = $"api-tests-{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Program.cs refuses to start without a connection string; it is never used.
            builder.UseSetting("ConnectionStrings:DonationAppContext", "Host=unused");
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<DbContextOptions<DonationAppContext>>();
                services.RemoveAll<DonationAppContext>();
                services.AddDbContext<DonationAppContext>(options => options.UseInMemoryDatabase(_databaseName));

                services.AddAuthentication(TestAuthHandler.SchemeName)
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
                services.Configure<AuthenticationOptions>(options =>
                {
                    options.DefaultScheme = TestAuthHandler.SchemeName;
                    options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                    options.DefaultForbidScheme = TestAuthHandler.SchemeName;
                });
            });
        }
    }

    public static class WebApplicationFactoryExtensions
    {
        /// <summary>Runs a query against the test database (seeded by DataSeeder on startup).</summary>
        public static async Task<T> QueryDbAsync<T>(this WebApplicationFactory<Program> factory, Func<DonationAppContext, Task<T>> query)
        {
            using IServiceScope scope = factory.Services.CreateScope();
            return await query(scope.ServiceProvider.GetRequiredService<DonationAppContext>());
        }
    }

    internal static class ServiceCollectionExtensions
    {
        public static void RemoveAll<T>(this IServiceCollection services)
        {
            foreach (ServiceDescriptor descriptor in services.Where(d => d.ServiceType == typeof(T)).ToList())
            {
                services.Remove(descriptor);
            }
        }
    }

    /// <summary>
    /// Authenticates requests the way a Keycloak token would, from <see cref="TestIdentity"/> headers:
    /// "sub", "email", "email_verified" and a <c>realm_access</c> JSON claim, so the real
    /// KeycloakClaimsTransformation and authorization policies run. A request without headers is a
    /// network admin (what the older tests expect); <see cref="TestIdentity.Anonymous"/> sends no identity.
    /// </summary>
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "Test";

        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            IHeaderDictionary headers = Request.Headers;
            if (headers.ContainsKey(TestIdentity.AnonymousHeader))
            {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            string subject = headers[TestIdentity.SubjectHeader].FirstOrDefault() ?? Guid.NewGuid().ToString();
            string roles = headers[TestIdentity.RolesHeader].FirstOrDefault() ?? "Admin";

            List<Claim> claims = new List<Claim>
            {
                new Claim("sub", subject),
                new Claim("realm_access", JsonSerializer.Serialize(new { roles = roles.Split(',', StringSplitOptions.RemoveEmptyEntries) })),
            };

            string? email = headers[TestIdentity.EmailHeader].FirstOrDefault();
            if (email != null)
            {
                claims.Add(new Claim("email", email));
                claims.Add(new Claim("email_verified", headers[TestIdentity.EmailVerifiedHeader].FirstOrDefault() ?? "false"));
            }

            ClaimsIdentity identity = new ClaimsIdentity(claims, SchemeName, "preferred_username", ClaimTypes.Role);
            AuthenticationTicket ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }

    /// <summary>Who a test request is sent as. Apply with <see cref="TestIdentityExtensions.As"/>.</summary>
    public sealed record TestIdentity(string Subject, string Roles, string? Email = null, bool EmailVerified = false)
    {
        internal const string AnonymousHeader = "X-Test-Anonymous";
        internal const string SubjectHeader = "X-Test-Sub";
        internal const string RolesHeader = "X-Test-Roles";
        internal const string EmailHeader = "X-Test-Email";
        internal const string EmailVerifiedHeader = "X-Test-Email-Verified";

        public static readonly TestIdentity Anonymous = new TestIdentity(string.Empty, string.Empty);

        public static TestIdentity Donor(string? email = null, bool emailVerified = true) =>
            new TestIdentity(Guid.NewGuid().ToString(), "donor", email ?? $"donor-{Guid.NewGuid():N}@example.com", emailVerified);

        public static TestIdentity WithRoles(string roles) => new TestIdentity(Guid.NewGuid().ToString(), roles);

        public bool IsAnonymous => ReferenceEquals(this, Anonymous);
    }

    public static class TestIdentityExtensions
    {
        public static HttpRequestMessage As(this HttpRequestMessage request, TestIdentity identity)
        {
            if (identity.IsAnonymous)
            {
                request.Headers.Add(TestIdentity.AnonymousHeader, "true");
                return request;
            }

            request.Headers.Add(TestIdentity.SubjectHeader, identity.Subject);
            request.Headers.Add(TestIdentity.RolesHeader, identity.Roles);
            if (identity.Email != null)
            {
                request.Headers.Add(TestIdentity.EmailHeader, identity.Email);
                request.Headers.Add(TestIdentity.EmailVerifiedHeader, identity.EmailVerified ? "true" : "false");
            }

            return request;
        }

        public static Task<HttpResponseMessage> SendAs(this HttpClient client, TestIdentity identity, HttpMethod method, string url, object? body = null)
        {
            HttpRequestMessage request = new HttpRequestMessage(method, url).As(identity);
            if (body != null)
            {
                request.Content = JsonContent.Create(body);
            }

            return client.SendAsync(request);
        }
    }
}
