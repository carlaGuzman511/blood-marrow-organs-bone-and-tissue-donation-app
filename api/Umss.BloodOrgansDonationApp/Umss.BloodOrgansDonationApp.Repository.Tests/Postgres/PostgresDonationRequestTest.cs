using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;

namespace Umss.BloodOrgansDonationApp.Repository.Tests.Postgres
{
    /// <summary>
    /// US-API-01/02 on a real Postgres (see <see cref="PostgresFactAttribute"/>): the migration
    /// keeps existing priority posts, the folio is generated, and the board query and the
    /// concurrency check work as SQL, not only in memory.
    /// </summary>
    public class PostgresDonationRequestTest : IAsyncLifetime
    {
        private const string MigrationBefore = "20261020040433_AddDonationPostFeedIndex";

        private readonly DbContextOptions<DonationAppContext> _options;
        private static bool Enabled => Environment.GetEnvironmentVariable(PostgresFactAttribute.Variable) != null;

        public PostgresDonationRequestTest()
        {
            NpgsqlConnectionStringBuilder builder = new NpgsqlConnectionStringBuilder(
                Environment.GetEnvironmentVariable(PostgresFactAttribute.Variable) ?? "Host=unused")
            {
                Database = $"donavida_test_{Guid.NewGuid():N}",
            };
            _options = new DbContextOptionsBuilder<DonationAppContext>().UseNpgsql(builder.ConnectionString).Options;
        }

        public Task InitializeAsync() => Task.CompletedTask;

        public async Task DisposeAsync()
        {
            if (Enabled)
            {
                await using DonationAppContext context = NewContext();
                await context.Database.EnsureDeletedAsync();
            }
        }

        private DonationAppContext NewContext() => new DonationAppContext(_options);

        private static async Task MigrateTo(DonationAppContext context, string? target = null)
        {
            await context.GetService<IMigrator>().MigrateAsync(target);
        }

        [PostgresFact]
        public async Task Migration_TurnsPriorityIntoUrgency_AndNumbersExistingPosts()
        {
            Guid bloodType = Guid.NewGuid(), donationType = Guid.NewGuid(), urgent = Guid.NewGuid(), normal = Guid.NewGuid();
            await using (DonationAppContext context = NewContext())
            {
                await MigrateTo(context, MigrationBefore);
                await context.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO ""BloodTypes"" (""Id"", ""Name"", ""Image"") VALUES ({bloodType}, 'O-', 'o.png');
                    INSERT INTO ""DonationTypes"" (""Id"", ""Name"", ""Description"", ""Requirements"", ""Process"", ""Importance"", ""Benefits"", ""SecondaryEffects"", ""Image"")
                        VALUES ({donationType}, 'Sangre', '-', '-', '-', '-', '-', '-', '-');
                    INSERT INTO ""DonationPosts"" (""Id"", ""BloodTypeId"", ""DonationTypeId"", ""Priority"", ""Title"", ""Description"", ""Image"", ""CreatedAt"", ""UpdatedAt"")
                        VALUES ({urgent}, {bloodType}, {donationType}, TRUE, 'Urgente', '-', '-', now(), now()),
                               ({normal}, {bloodType}, {donationType}, FALSE, 'Normal', '-', '-', now(), now());");

                await MigrateTo(context);
            }

            await using DonationAppContext check = NewContext();
            List<DonationPost> posts = await check.DonationPosts.AsNoTracking().OrderBy(p => p.Title).ToListAsync();
            Assert.Equal(new[] { Urgency.Standard, Urgency.Priority }, posts.Select(p => p.Urgency));
            Assert.All(posts, p => Assert.True(p.Folio >= 1000));
            Assert.Equal(2, posts.Select(p => p.Folio).Distinct().Count());
            Assert.All(posts, p => Assert.Null(p.Status)); // old posts are not clinical requests
        }

        private async Task<(Guid BloodA, Guid BloodO, Guid Type, Guid Center)> SeedCatalogsAsync(DonationAppContext context)
        {
            BloodType a = new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "a.png" };
            BloodType o = new BloodType { Id = Guid.NewGuid(), Name = "O-", Image = "o.png" };
            DonationType type = new DonationType
            {
                Id = Guid.NewGuid(),
                Name = "Sangre",
                Description = "-",
                Requirements = "-",
                Process = "-",
                Importance = "-",
                Benefits = "-",
                SecondaryEffects = "-",
                Image = "-",
            };
            DonationCenter center = new DonationCenter
            {
                Id = Guid.NewGuid(),
                Name = "Hospital",
                Address = "-",
                City = "Cochabamba",
                Email = "h@test.com",
                OpeningHours = "-",
                Phone = "1",
                Image = "-",
                Latitude = 0,
                Longitude = 0,
                DonationCenterDonationTypes = new List<DonationCenterDonationType>(),
            };
            context.AddRange(a, o, type, center);
            await context.SaveChangesAsync();
            return (a.Id, o.Id, type.Id, center.Id);
        }

        private static DonationPost NewRequest((Guid BloodA, Guid BloodO, Guid Type, Guid Center) c, string title, Urgency urgency, Guid bloodType, DateTime? deadline, RequestStatus status = RequestStatus.SearchingDonors) => new DonationPost
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = "-",
            Image = string.Empty,
            BloodTypeId = bloodType,
            DonationTypeId = c.Type,
            DonationCenterId = c.Center,
            Urgency = urgency,
            Component = BloodComponent.PlateletsApheresis,
            Status = status,
            StatusChangedAt = DateTime.UtcNow,
            UnitsRequired = 4,
            Deadline = deadline,
            PatientCode = "PX-1",
            CoordinationPhone = "70000000",
            CreatedAt = DateTime.UtcNow,
        };

        [PostgresFact]
        public async Task BoardQuery_RunsAsSql_WithUrgencyOrderAndListFilters()
        {
            DateTime now = DateTime.UtcNow;
            await using (DonationAppContext context = NewContext())
            {
                await MigrateTo(context);
                var c = await SeedCatalogsAsync(context);
                context.DonationPosts.AddRange(
                    NewRequest(c, "estandar", Urgency.Standard, c.BloodA, now.AddHours(1)),
                    NewRequest(c, "prioritario", Urgency.Priority, c.BloodO, now.AddHours(18)),
                    NewRequest(c, "rojo", Urgency.CodeRed, c.BloodA, now.AddMinutes(35)),
                    NewRequest(c, "cerrada", Urgency.CodeRed, c.BloodA, now.AddMinutes(5), RequestStatus.Completed));
                await context.SaveChangesAsync();
            }

            await using DonationAppContext read = NewContext();
            DonationRequestRepository repository = new DonationRequestRepository(read);

            var open = await repository.Get(new DonationRequestQuery { Open = true }, searchPatientCode: false);
            Assert.Equal(new[] { "rojo", "prioritario", "estandar" }, open.Items.Select(r => r.Title));
            Assert.All(open.Items, r => Assert.True(r.Folio >= 1000));

            List<Guid> both = await read.BloodTypes.Select(b => b.Id).ToListAsync();
            var filtered = await repository.Get(new DonationRequestQuery
            {
                Open = true,
                BloodTypeId = both,
                Component = BloodComponent.PlateletsApheresis,
                Search = "REQ-" + open.Items[0].Folio,
            }, searchPatientCode: true);
            Assert.Equal("rojo", Assert.Single(filtered.Items).Title);
        }

        [PostgresFact]
        public async Task Save_WithAStalePhase_IsRejectedByTheDatabase()
        {
            Guid id;
            await using (DonationAppContext context = NewContext())
            {
                await MigrateTo(context);
                var c = await SeedCatalogsAsync(context);
                DonationPost request = NewRequest(c, "disputada", Urgency.CodeRed, c.BloodA, DateTime.UtcNow.AddHours(1));
                context.DonationPosts.Add(request);
                await context.SaveChangesAsync();
                id = request.Id;
            }

            await using (DonationAppContext other = NewContext())
            {
                await other.DonationPosts.Where(p => p.Id == id)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, RequestStatus.Cancelled));
            }

            await using DonationAppContext context2 = NewContext();
            DonationRequestRepository repository = new DonationRequestRepository(context2);
            DonationPost stale = (await repository.Get(id))!;
            stale.Status = RequestStatus.DonorsOnTheWay;

            await Assert.ThrowsAsync<ConflictException>(() =>
                repository.Save(stale, new RequestState(RequestStatus.SearchingDonors, 0), null));
        }
    }
}
