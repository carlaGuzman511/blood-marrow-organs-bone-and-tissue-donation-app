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

`Umss.BloodOrgansDonationApp.Repository.Tests` runs repositories against EF Core InMemory (`Utilities/InMemoryDatabase`, one isolated store per test; use `NewContext()` to assert through a fresh context, like a new request scope). Tests under `Postgres/` (`[PostgresFact]`) run against a real server only when `POSTGRES_TEST_CONNECTION` is set (e.g. `Host=localhost;Port=5432;Username=postgres;Password=postgres`): they apply all migrations to a throwaway database and drop it afterwards. Use them for anything InMemory can't check (migrations, unique indexes, `ExecuteUpdate`).

`DataSeeder` currently fails on an empty database: the seeded donation centers lack the required `Email`/`OpeningHours`/`Phone`, so `SaveChangesAsync` throws and nothing is seeded (the error is only printed by `Program.cs`). Tests create their own data instead.

Migrations and data seeding (`DataSeeder.SeedAsync`) run automatically on API startup (see `Program.cs`) — there's no separate seed command.

### CI

`.github/workflows/api-ci.yml` (repo root) runs on push/PR touching `api/**`: restore → `dotnet format --verify-no-changes` → Release build → `dotnet test` with coverlet coverage (ReportGenerator summary + Codecov, needs the `CODECOV_TOKEN` repo secret) → gitleaks secret scan of `api/`. Formatting rules live in `.editorconfig` next to the `.sln`; before pushing run:

```bash
dotnet format Umss.BloodOrgansDonationApp.sln
```

The API is Dockerized (`Umss.BloodOrgansDonationApp.API/Dockerfile`, multi-stage build, publishes `linux-x64`, listens on 8080 in the container).

## Architecture

Four-project layered architecture, always wired in this direction — one direction only, no back-references:

```
API (Controllers) → Services → Repository → Models
```

- **Models**: entities (`Entities/`), DTOs split into `Requests/` (inbound) and `Responses/` (outbound), AutoMapper `Profile` classes (`AutoMapper/`) mapping Entity ⇄ Request/Response, and shared exception types (`Exceptions/BusinessException`, `Exceptions/EntityNotFoundException`).
- **Repository**: one repository class + interface per entity (e.g. `DonationPostRepository` / `IDonationPostRepository`), plus `Data/DonationAppContext` (an `IdentityDbContext<User, IdentityRole<Guid>, Guid>`) and `Data/DataSeeder`. Entity relationships and delete behavior are configured in `DonationAppContext.OnModelCreating` (e.g. `DonationCenterDonationType` is a composite-key join entity; most FKs use `DeleteBehavior.Restrict`, `Comment → DonationPost` cascades).
- **Services**: business logic layer, one service + interface per entity. Services call the repository, run FluentValidation validators inline (`new XRequestValidator().ValidateAndThrow(request)` — validators are *not* wired through DI or ASP.NET's automatic validation pipeline), map between entities and DTOs via injected `IMapper`, and throw `EntityNotFoundException`/`ValidationException` for the controller to translate into HTTP responses.
- **API**: thin `[ApiController]` controllers, one per entity, under `api/...` routes. Controllers do **not** catch exceptions: `Middlewares/ExceptionMiddleware` (first in the pipeline) is the single place that turns them into RFC 7807 `application/problem+json` responses — `ValidationException` → 400 (`errors` grouped by property, same shape as ASP.NET's automatic model-binding 400), `EntityNotFoundException` → 404, `BusinessException` → 400, anything else → 500 with a generic message (logged, details never returned). Services should throw these exceptions; controllers only handle the "service returned null" → 404 case.

Two generic interfaces express the common CRUD shape but are only loosely followed — most entities implement their own richer interface rather than depending on the generic ones directly:
- `IDonationAppRepository<T>`: `GetAll / Get / Create / Update / Delete`
- `IDonationAppService<R, P>`: same shape, `R` = request DTO in, `P` = response DTO out

**DonationPost** is the one entity with dual-parent access patterns — it can be reached and mutated both under `users/{userId}/donation-posts/...` and `donation-centers/{donationCenterId}/donation-posts/...`, so `IDonationPostRepository`/`IDonationPostService` have `...ByUser` and `...ByDonationCenter` variants instead of the plain generic CRUD methods.

### Auth

JWT Bearer auth is enforced via Keycloak (`AddJwtBearer` in `Program.cs`, `Authority`/`Audience` from `Keycloak:*` in `appsettings*.json`, pointed at `https://auth-server-b24f.onrender.com/realms/organ-donation-prod`); signing keys come from Keycloak's JWKS endpoint. `MapInboundClaims = false`, so claims keep Keycloak's names (`sub`, `email`, `email_verified`).

- **Closed by default:** a fallback policy requires a signed-in user on every endpoint; public ones must say `[AllowAnonymous]` (today only the deprecated `POST /api/users/register` and `/login`).
- **Roles:** `Security/KeycloakClaimsTransformation` projects `realm_access.roles` onto `ClaimTypes.Role`, lower-cased, for every auth scheme. Role names live only in `Models/Security/AppRoles` (`donor`, `clinical_staff`, `network_admin`; legacy `admin` counts as network admin). Use named policies from `Security/AppPolicies` (`[Authorize(Policy = AppPolicies.NetworkAdmin)]`), never `[Authorize(Roles = "...")]`.
- **Who is calling:** never trust a user id from the route or body. Services inject `ICurrentUserService`: `Caller` (from the token), `GetProfileAsync()` (local `User` linked by `User.KeycloakSubject`, unique), `RequireProfileIdAsync()`, `EnsureSelfOrAdminAsync(userId)`, `IsNetworkAdmin`. A Keycloak user is linked to an existing profile on first use **only** by a verified email (`email_verified`), and only if exactly one unlinked profile has it.
- **Own profile:** `/api/me` (GET/POST/PUT, `ProfileService`). 404 on GET means "no profile yet": the client must call POST. Email always comes from the token.
- **Other users' data:** `/api/donors` (any signed-in user) returns `DonorResponse` only: name, photo, city, blood type. Never add address, phone, email, date of birth or coordinates to it; full `UserResponse` is for yourself (`/api/me`) or network admins (`/api/users`).
- **Ownership checks live in the services** (throw `ForbiddenException` -> 403): `users/{userId}/...` writes and `/api/users/{id}` are self-or-admin; listing/deleting users is admin-only; comment author is the caller, and only the author or an admin edits/deletes it. Center-scoped routes (`donation-centers/{id}/...`) are not restricted yet (US-API-12 increments 2-3: `clinical_staff` + center claim).
- `ExceptionMiddleware` also maps `ForbiddenException` -> 403 and `ConflictException` -> 409.

### Validation messages

FluentValidation rule messages are written in Spanish (e.g. "La imagen de la publicacion es requerido") — match this convention when adding new validators.

### Testing

xUnit + Moq, split by layer, mirroring the architecture:
- `Umss.BloodOrgansDonationApp.API.Tests`: controller tests, mock services via `Utilities/ServiceFixture`. `Integration/` boots the real pipeline with `Utilities/ApiFactory` (`WebApplicationFactory<Program>`, EF InMemory, a header-driven test auth scheme). Send as someone with `client.SendAs(TestIdentity.Donor(), ...)` / `TestIdentity.WithRoles("network_admin")` / `TestIdentity.Anonymous`; a request with no identity headers is a network admin. Create data with `Utilities/TestData` (`AddUserAsync`, `AddPostAsync`...) rather than relying on `DataSeeder`. `Utilities/JwtApiFactory` runs the real JwtBearer config with locally signed Keycloak-shaped tokens (`CreateToken`).
- `Umss.BloodOrgansDonationApp.Service.Tests`: service tests, mock repositories (and `IMapper`, `ITokenService`) via `Utilities/RepositoryFixture`.

Both fixtures hold one `Mock<T>` + resolved interface instance per dependency as protected/internal properties — extend these fixtures rather than instantiating mocks ad hoc in individual test classes.

### Database

Repository `Get*` methods return **untracked** entities (`AsNoTracking`). `Update()` therefore loads the tracked row with `FindAsync` and copies values with `Entry(tracked).CurrentValues.SetValues(...)` — never call `SaveChangesAsync()` on an entity returned by a `Get*`. Timestamp columns are `timestamp with time zone`: always write `DateTime.UtcNow` (Npgsql rejects `DateTimeKind.Local`).

PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL`, connection string `ConnectionStrings:DonationAppContext`. **Never commit a real connection string.** `appsettings.json` leaves it empty and the API refuses to start without one:
- Production (Render): environment variable `ConnectionStrings__DonationAppContext`.
- Local: `appsettings.Development.json` points at a local Postgres (`localhost:5433`, `postgres/postgres`). To use a remote DB instead, use user-secrets: `dotnet user-secrets set "ConnectionStrings:DonationAppContext" "<conn>" --project Umss.BloodOrgansDonationApp.API`.
