using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text.Json;
using Umss.BloodOrgansDonationApp.API.Middlewares;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.AutoMapper;
using Umss.BloodOrgansDonationApp.Repository;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";

builder.WebHost.UseUrls($"http://*:{port}");

// Never committed: set ConnectionStrings__DonationAppContext (Render) or dotnet user-secrets (local).
var connectionString = builder.Configuration.GetConnectionString("DonationAppContext");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Missing connection string 'DonationAppContext'. Set the ConnectionStrings__DonationAppContext environment variable or a dotnet user-secret.");
}

builder.Services.AddDbContext<DonationAppContext>(
    options => options.UseNpgsql(connectionString));

builder.Services.AddIdentity<User, IdentityRole<Guid>>
    (options =>
    {
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = true;
        options.Password.RequireDigit = true;

    })
    .AddEntityFrameworkStores<DonationAppContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Tokens are issued by Keycloak; signing keys are fetched from its
    // /.well-known/openid-configuration + JWKS endpoint via Authority, not configured statically.
    options.Authority = builder.Configuration["Keycloak:Authority"];
    options.Audience = builder.Configuration["Keycloak:Audience"];
    options.RequireHttpsMetadata = builder.Configuration.GetValue<bool>("Keycloak:RequireHttpsMetadata", true);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
    };
    options.Events = new JwtBearerEvents
    {
        // Keycloak puts realm roles under the "realm_access.roles" claim rather than
        // the standard role claim type, so [Authorize(Roles = "...")] would never match
        // without projecting them onto ClaimTypes.Role here.
        OnTokenValidated = context =>
        {
            var realmAccess = context.Principal?.FindFirst("realm_access")?.Value;
            if (!string.IsNullOrEmpty(realmAccess) && context.Principal?.Identity is ClaimsIdentity identity)
            {
                using var doc = JsonDocument.Parse(realmAccess);
                if (doc.RootElement.TryGetProperty("roles", out var roles))
                {
                    foreach (var role in roles.EnumerateArray())
                    {
                        var roleName = role.GetString();
                        if (!string.IsNullOrEmpty(roleName))
                        {
                            identity.AddClaim(new Claim(ClaimTypes.Role, roleName));
                        }
                    }
                }
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<IDonationCenterRepository, DonationCenterRepository>();
builder.Services.AddScoped<IBloodTypeRepository, BloodTypeRepository>();
builder.Services.AddScoped<IDonationTypeRepository, DonationTypeRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDonationPostRepository, DonationPostRepository>();

builder.Services.AddScoped<IDonationCenterService, DonationCenterService>();
builder.Services.AddScoped<IBloodTypeService, BloodTypeService>();
builder.Services.AddScoped<IDonationTypeService, DonationTypeService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDonationPostService, DonationPostService>();

builder.Services.AddAutoMapper(typeof(CommentProfile).Assembly);
builder.Services.AddAutoMapper(typeof(UserProfile).Assembly);
builder.Services.AddAutoMapper(typeof(DonationTypeProfile).Assembly);
builder.Services.AddAutoMapper(typeof(DonationCenterProfile).Assembly);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(7140);
});


var app = builder.Build();


// Configure the HTTP request pipeline.

// First so it wraps everything else: the only place exceptions become HTTP responses.
app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DonationAppContext>();

    try
    {
        // Integration tests swap in a non-relational provider that cannot run migrations.
        if (db.Database.IsRelational())
        {
            Console.WriteLine("Applying migrations...");

            db.Database.Migrate();
        }

        Console.WriteLine("Running seed...");

        await DataSeeder.SeedAsync(db);

        Console.WriteLine("Seed completed.");
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.Message);
        Console.WriteLine(ex.InnerException?.Message);
    }
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Exposes the implicit Program class to WebApplicationFactory<Program> in the integration tests.
public partial class Program { }
