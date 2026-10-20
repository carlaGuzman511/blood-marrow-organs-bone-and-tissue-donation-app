using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.API.Tests.Utilities
{
    /// <summary>
    /// Boots the API with its real JwtBearer configuration from Program.cs (schemes, claim mapping,
    /// claims transformation, policies). Only the key source changes: instead of Keycloak's JWKS endpoint,
    /// tokens are signed with a local test key via <see cref="CreateToken"/>.
    /// </summary>
    public class JwtApiFactory : WebApplicationFactory<Program>
    {
        public const string Issuer = "https://keycloak.test/realms/organ-donation-prod";
        public const string Audience = "organ-donation-api";

        private static readonly SymmetricSecurityKey SigningKey =
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes("test-only-signing-key-0123456789-abcdefghij"));

        private readonly string _databaseName = $"jwt-tests-{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseSetting("ConnectionStrings:DonationAppContext", "Host=unused");
            builder.UseSetting("Keycloak:Authority", Issuer);
            builder.UseSetting("Keycloak:Audience", Audience);
            builder.UseEnvironment("Testing");

            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<DbContextOptions<DonationAppContext>>();
                services.RemoveAll<DonationAppContext>();
                services.AddDbContext<DonationAppContext>(options => options.UseInMemoryDatabase(_databaseName));

                // Runs after Program.cs's AddJwtBearer: swap the network-backed metadata for a static one.
                services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration { Issuer = Issuer };
                    configuration.SigningKeys.Add(SigningKey);
                    options.Configuration = configuration;
                    options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(configuration);
                });
            });
        }

        /// <summary>A token shaped like Keycloak's: realm roles under <c>realm_access.roles</c>.</summary>
        public static string CreateToken(string subject, IEnumerable<string> realmRoles, string? email = null, bool emailVerified = false)
        {
            Dictionary<string, object> claims = new Dictionary<string, object>
            {
                ["sub"] = subject,
                ["realm_access"] = new Dictionary<string, object> { ["roles"] = realmRoles.ToArray() },
            };

            if (email != null)
            {
                claims["email"] = email;
                claims["email_verified"] = emailVerified;
            }

            return new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
            {
                Issuer = Issuer,
                Audience = Audience,
                Claims = claims,
                Expires = DateTime.UtcNow.AddMinutes(5),
                SigningCredentials = new SigningCredentials(SigningKey, SecurityAlgorithms.HmacSha256),
            });
        }
    }
}
