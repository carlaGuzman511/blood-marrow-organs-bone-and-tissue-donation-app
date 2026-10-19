using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
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
                });
            });
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

    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "Test";

        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            ClaimsIdentity identity = new ClaimsIdentity(
                new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") },
                SchemeName);
            AuthenticationTicket ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
