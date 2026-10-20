using Microsoft.EntityFrameworkCore;
using Npgsql;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.Repository.Tests.Postgres
{
    /// <summary>
    /// Runs only when POSTGRES_TEST_CONNECTION points at a Postgres server (any database name; a
    /// throwaway database is created and dropped). Covers what EF InMemory can't: the real migrations,
    /// the conditional UPDATE in TryLinkKeycloakSubjectAsync and the unique index on KeycloakSubject.
    /// Example: POSTGRES_TEST_CONNECTION="Host=localhost;Port=5432;Username=postgres;Password=postgres"
    /// </summary>
    public sealed class PostgresFactAttribute : FactAttribute
    {
        public const string Variable = "POSTGRES_TEST_CONNECTION";

        public PostgresFactAttribute()
        {
            if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(Variable)))
            {
                Skip = $"Set {Variable} to run the Postgres tests.";
            }
        }
    }

    public class PostgresUserLinkTest : IAsyncLifetime
    {
        private readonly DbContextOptions<DonationAppContext> _options;

        public PostgresUserLinkTest()
        {
            NpgsqlConnectionStringBuilder builder = new NpgsqlConnectionStringBuilder(
                Environment.GetEnvironmentVariable(PostgresFactAttribute.Variable) ?? "Host=unused")
            {
                Database = $"donavida_test_{Guid.NewGuid():N}",
            };
            _options = new DbContextOptionsBuilder<DonationAppContext>().UseNpgsql(builder.ConnectionString).Options;
        }

        public async Task InitializeAsync()
        {
            if (Environment.GetEnvironmentVariable(PostgresFactAttribute.Variable) != null)
            {
                await using DonationAppContext context = new DonationAppContext(_options);
                await context.Database.MigrateAsync();
            }
        }

        public async Task DisposeAsync()
        {
            if (Environment.GetEnvironmentVariable(PostgresFactAttribute.Variable) != null)
            {
                await using DonationAppContext context = new DonationAppContext(_options);
                await context.Database.EnsureDeletedAsync();
            }
        }

        private DonationAppContext NewContext() => new DonationAppContext(_options);

        private async Task<User> AddUserAsync(string email)
        {
            await using DonationAppContext context = NewContext();
            BloodType bloodType = new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "a.png" };
            User user = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Test",
                Email = email,
                BloodTypeId = bloodType.Id,
                Address = "Calle 1",
                Latitude = 0,
                Longitude = 0,
                Image = "u.png",
                DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            };
            context.AddRange(bloodType, user);
            await context.SaveChangesAsync();
            return user;
        }

        [PostgresFact(DisplayName = "Postgres: all migrations apply and linking is a conditional, one-time update")]
        public async Task LinkOnce()
        {
            User user = await AddUserAsync("Ana@Example.com");

            await using (DonationAppContext context = NewContext())
            {
                UserRepository repository = new UserRepository(context, null!);
                Assert.Equal(user.Id, Assert.Single(await repository.GetUnlinkedByEmailAsync("ana@example.COM")).Id);
                Assert.True(await repository.TryLinkKeycloakSubjectAsync(user.Id, "kc-1"));
                Assert.False(await repository.TryLinkKeycloakSubjectAsync(user.Id, "kc-2"));
                Assert.Empty(await repository.GetUnlinkedByEmailAsync("ana@example.com"));
            }

            await using DonationAppContext verify = NewContext();
            Assert.Equal("kc-1", (await verify.Users.SingleAsync(u => u.Id == user.Id)).KeycloakSubject);
        }

        [PostgresFact(DisplayName = "Postgres: one Keycloak user can't be linked to two profiles (unique index)")]
        public async Task SubjectIsUnique()
        {
            User first = await AddUserAsync("one@example.com");
            User second = await AddUserAsync("two@example.com");

            await using DonationAppContext context = NewContext();
            UserRepository repository = new UserRepository(context, null!);

            Assert.True(await repository.TryLinkKeycloakSubjectAsync(first.Id, "kc-same"));
            Assert.False(await repository.TryLinkKeycloakSubjectAsync(second.Id, "kc-same"));
            Assert.Equal(first.Id, (await repository.GetByKeycloakSubjectAsync("kc-same"))?.Id);
        }
    }
}
