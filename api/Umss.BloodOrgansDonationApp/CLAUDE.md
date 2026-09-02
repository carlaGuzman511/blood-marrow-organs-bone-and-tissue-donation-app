# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is the `api/` half of a larger repo (there is a separate `mobile/` app alongside it). All commands below are run from this directory (`Umss.BloodOrgansDonationApp/`), which contains the `.sln`.

```bash
# Build everything
dotnet build

# Run the API (listens on http://localhost:5254 and https://*:7140 per launchSettings.json)
dotnet run --project Umss.BloodOrgansDonationApp.API

# Run all tests
dotnet test

# Run one test project
dotnet test Umss.BloodOrgansDonationApp.API.Tests
dotnet test Umss.BloodOrgansDonationApp.Service.Tests

# Run a single test
dotnet test --filter "FullyQualifiedName~DonationPostServiceTest.Create_ShouldReturnResponse"

# EF Core migrations (run from the Repository project, or pass --project/--startup-project from elsewhere)
dotnet ef migrations add <Name> --project Umss.BloodOrgansDonationApp.Repository --startup-project Umss.BloodOrgansDonationApp.API
dotnet ef database update --project Umss.BloodOrgansDonationApp.Repository --startup-project Umss.BloodOrgansDonationApp.API
```

Note: `Umss.BloodOrgansDonationApp.Repository.Tests` exists on disk but is **not** included in the `.sln` and is a placeholder (`UnitTest1.cs`) — repository-level logic is currently exercised indirectly through the Service.Tests project, which mocks repositories.

Migrations and data seeding (`DataSeeder.SeedAsync`) run automatically on API startup (see `Program.cs`) — there's no separate seed command.

The API is Dockerized (`Umss.BloodOrgansDonationApp.API/Dockerfile`, multi-stage build, publishes `linux-x64`, listens on 8080 in the container).

## Architecture

Four-project layered architecture, always wired in this direction — one direction only, no back-references:

```
API (Controllers) → Services → Repository → Models
```

- **Models**: entities (`Entities/`), DTOs split into `Requests/` (inbound) and `Responses/` (outbound), AutoMapper `Profile` classes (`AutoMapper/`) mapping Entity ⇄ Request/Response, and shared exception types (`Exceptions/BusinessException`, `Exceptions/EntityNotFoundException`).
- **Repository**: one repository class + interface per entity (e.g. `DonationPostRepository` / `IDonationPostRepository`), plus `Data/DonationAppContext` (an `IdentityDbContext<User, IdentityRole<Guid>, Guid>`) and `Data/DataSeeder`. Entity relationships and delete behavior are configured in `DonationAppContext.OnModelCreating` (e.g. `DonationCenterDonationType` is a composite-key join entity; most FKs use `DeleteBehavior.Restrict`, `Comment → DonationPost` cascades).
- **Services**: business logic layer, one service + interface per entity. Services call the repository, run FluentValidation validators inline (`new XRequestValidator().ValidateAndThrow(request)` — validators are *not* wired through DI or ASP.NET's automatic validation pipeline), map between entities and DTOs via injected `IMapper`, and throw `EntityNotFoundException`/`ValidationException` for the controller to translate into HTTP responses.
- **API**: thin controllers, one per entity, under `api/...` routes. Controllers manually catch `ValidationException` → 400 and generic `Exception` → 500 in *every* action (this is repeated per-method rather than centralized). `Middlewares/ExceptionMiddleware` also exists as a global fallback that maps `BusinessException` → 400, anything else → 500 — most exceptions are already caught in the controllers before they'd reach it.

Two generic interfaces express the common CRUD shape but are only loosely followed — most entities implement their own richer interface rather than depending on the generic ones directly:
- `IDonationAppRepository<T>`: `GetAll / Get / Create / Update / Delete`
- `IDonationAppService<R, P>`: same shape, `R` = request DTO in, `P` = response DTO out

**DonationPost** is the one entity with dual-parent access patterns — it can be reached and mutated both under `users/{userId}/donation-posts/...` and `donation-centers/{donationCenterId}/donation-posts/...`, so `IDonationPostRepository`/`IDonationPostService` have `...ByUser` and `...ByDonationCenter` variants instead of the plain generic CRUD methods.

### Auth

JWT Bearer auth is enforced via Keycloak (`Microsoft.AspNetCore.Identity` + `AddJwtBearer` in `Program.cs`), which is configured with `Authority`/`Audience` from `appsettings*.json` (`Keycloak:*`, pointed at the live server at `https://auth-server-b24f.onrender.com/realms/organ-donation-prod`) so signing keys are fetched from Keycloak's JWKS endpoint rather than a static key. `[Authorize]` is active on almost every controller action (only `POST /api/users/register` and the legacy `POST /api/users/login` stay anonymous) — don't assume an endpoint is open just because it looks like a read. `[Authorize(Roles = "Admin")]` actions rely on a `JwtBearerEvents.OnTokenValidated` handler in `Program.cs` that projects Keycloak's `realm_access.roles` claim onto `ClaimTypes.Role`, since ASP.NET's role-based `[Authorize]` doesn't understand Keycloak's nested claim shape by itself.

### Validation messages

FluentValidation rule messages are written in Spanish (e.g. "La imagen de la publicacion es requerido") — match this convention when adding new validators.

### Testing

xUnit + Moq, split by layer, mirroring the architecture:
- `Umss.BloodOrgansDonationApp.API.Tests`: controller tests, mock services via `Utilities/ServiceFixture`.
- `Umss.BloodOrgansDonationApp.Service.Tests`: service tests, mock repositories (and `IMapper`, `ITokenService`) via `Utilities/RepositoryFixture`.

Both fixtures hold one `Mock<T>` + resolved interface instance per dependency as protected/internal properties — extend these fixtures rather than instantiating mocks ad hoc in individual test classes.

### Database

PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL`, connection string in `appsettings.json` under `ConnectionStrings:DonationAppContext` (currently points at a hosted Neon instance with credentials committed in the file — be careful not to leak this further, and prefer environment-specific overrides over editing it directly).
