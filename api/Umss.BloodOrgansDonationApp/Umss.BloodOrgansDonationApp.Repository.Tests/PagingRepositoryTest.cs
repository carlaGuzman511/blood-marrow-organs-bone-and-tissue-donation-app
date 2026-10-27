using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Tests.Utilities;

namespace Umss.BloodOrgansDonationApp.Repository.Tests
{
    /// <summary>
    /// US-API-18 / US-API-26: list repositories page and filter in the query, with a unique order.
    /// Each test uses its own InMemory database.
    /// </summary>
    public class PagingRepositoryTest
    {
        private static readonly DateTime Start = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private readonly InMemoryDatabase _db = new InMemoryDatabase();

        private sealed class World
        {
            public BloodType APlus { get; } = new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "a.png" };
            public BloodType ONeg { get; } = new BloodType { Id = Guid.NewGuid(), Name = "O-", Image = "o.png" };
            public DonationType Sangre { get; } = Type("Sangre");
            public DonationType Medula { get; } = Type("Medula Osea");
            public User Author { get; set; } = null!;
            public DonationCenter Center { get; set; } = null!;
        }

        private static DonationType Type(string name) => new DonationType
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = "-",
            Requirements = "-",
            Process = "-",
            Importance = "-",
            Benefits = "-",
            SecondaryEffects = "-",
            Image = "dt.png",
        };

        private static User NewUser(string name, Guid bloodTypeId, string? city = "Cochabamba", string? email = null) => new User
        {
            Id = Guid.NewGuid(),
            UserName = name,
            Email = email ?? $"{Guid.NewGuid():N}@example.com",
            FullName = name,
            BloodTypeId = bloodTypeId,
            Address = "Calle 2",
            City = city,
            Latitude = 0,
            Longitude = 0,
            Image = "user.png",
        };

        private static DonationCenter NewCenter(string name, string city, string address = "Av. Siempre Viva", params DonationType[] types) => new DonationCenter
        {
            Id = Guid.NewGuid(),
            Name = name,
            Address = address,
            City = city,
            Email = "c@test.com",
            OpeningHours = "08-18",
            Phone = "4444444",
            Image = "c.png",
            Latitude = 0,
            Longitude = 0,
            DonationCenterDonationTypes = types.Select(t => new DonationCenterDonationType { DonationTypeId = t.Id }).ToList(),
        };

        private DonationPost NewPost(World w, DateTime createdAt, string title = "Se necesita sangre", Guid? id = null, bool priority = false,
            BloodType? bloodType = null, DonationType? donationType = null, Guid? userId = null, Guid? centerId = null, string description = "Urgente") => new DonationPost
            {
                Id = id ?? Guid.NewGuid(),
                Title = title,
                Description = description,
                Image = "p.png",
                Urgency = priority ? Urgency.Priority : Urgency.Standard,
                BloodTypeId = (bloodType ?? w.APlus).Id,
                DonationTypeId = (donationType ?? w.Sangre).Id,
                UserId = centerId == null ? (userId ?? w.Author.Id) : null,
                DonationCenterId = centerId,
                CreatedAt = createdAt,
            };

        private async Task<World> SeedAsync(Func<World, IEnumerable<object>>? extra = null)
        {
            World w = new World();
            w.Author = NewUser("Autor", w.APlus.Id);
            w.Center = NewCenter("Centro Norte", "Cochabamba", types: w.Sangre);

            await using DonationAppContext context = _db.NewContext();
            context.AddRange(w.APlus, w.ONeg, w.Sangre, w.Medula, w.Author, w.Center);
            if (extra != null)
            {
                context.AddRange(extra(w));
            }

            await context.SaveChangesAsync();
            return w;
        }

        private Task<PagedResult<DonationPost>> Feed(DonationPostQuery query) =>
            new DonationPostRepository(_db.NewContext()).Get(query);

        // ---------- Paging ----------

        [Fact(DisplayName = "Feed: 25 posts give a first page of 20 newest and a second page of 5, with the totals")]
        public async Task Feed_PagesNewestFirst()
        {
            List<DonationPost> posts = new List<DonationPost>();
            await SeedAsync(w =>
            {
                posts.AddRange(Enumerable.Range(0, 25).Select(i => NewPost(w, Start.AddHours(i), $"Post {i}")));
                return posts;
            });

            PagedResult<DonationPost> first = await Feed(new DonationPostQuery());
            PagedResult<DonationPost> second = await Feed(new DonationPostQuery { Page = 2 });

            Assert.Equal(20, first.Items.Count);
            Assert.Equal(5, second.Items.Count);
            Assert.All(new[] { first, second }, p => Assert.Equal(25, p.TotalCount));
            Assert.Equal(2, first.TotalPages);
            Assert.Equal(2, second.Page);

            List<Guid> expected = posts.OrderByDescending(p => p.CreatedAt).Select(p => p.Id).ToList();
            Assert.Equal(expected, first.Items.Concat(second.Items).Select(p => p.Id).ToList());
        }

        [Fact(DisplayName = "Feed: posts with the same date are ordered by id, so pages never repeat or skip a post")]
        public async Task Feed_TieBreakerIsId()
        {
            // Inserted with ascending ids; the expected order is descending, so a missing tie-breaker shows.
            List<Guid> ids = Enumerable.Range(1, 5).Select(i => Guid.Parse($"00000000-0000-0000-0000-00000000000{i}")).ToList();
            await SeedAsync(w => ids.Select(id => NewPost(w, Start, id: id)));

            PagedResult<DonationPost> first = await Feed(new DonationPostQuery { PageSize = 2 });
            PagedResult<DonationPost> second = await Feed(new DonationPostQuery { PageSize = 2, Page = 2 });
            PagedResult<DonationPost> third = await Feed(new DonationPostQuery { PageSize = 2, Page = 3 });

            List<Guid> paged = first.Items.Concat(second.Items).Concat(third.Items).Select(p => p.Id).ToList();
            Assert.Equal(Enumerable.Reverse(ids).ToList(), paged);
        }

        [Fact(DisplayName = "A page past the end is empty but still reports the total")]
        public async Task PagePastTheEnd_IsEmpty()
        {
            await SeedAsync(w => Enumerable.Range(0, 3).Select(i => NewPost(w, Start.AddHours(i))));

            PagedResult<DonationPost> page = await Feed(new DonationPostQuery { Page = 50 });
            PagedResult<DonationPost> huge = await Feed(new DonationPostQuery { Page = int.MaxValue, PageSize = PageQuery.MaxPageSize });

            Assert.Empty(page.Items);
            Assert.Equal(3, page.TotalCount);
            Assert.Empty(huge.Items);
        }

        [Fact(DisplayName = "Feed items keep their details (author, types, comments) when paged")]
        public async Task Feed_IncludesDetails()
        {
            World? world = null;
            await SeedAsync(w =>
            {
                world = w;
                DonationPost post = NewPost(w, Start);
                return new object[]
                {
                    post,
                    new Comment { Id = Guid.NewGuid(), DonationPostId = post.Id, UserId = w.Author.Id, Description = "Puedo", CreatedAt = Start },
                };
            });

            DonationPost item = Assert.Single((await Feed(new DonationPostQuery())).Items);

            Assert.Equal("Autor", item.User?.FullName);
            Assert.Equal("A+", item.BloodType.Name);
            Assert.Equal("Sangre", item.DonationType.Name);
            Assert.Equal("Autor", Assert.Single(item.Comments).User.FullName);
        }

        // ---------- Post filters ----------

        [Fact(DisplayName = "Feed filters: search (title or description, any case), blood type, donation type, priority, center")]
        public async Task Feed_Filters()
        {
            World w = await SeedAsync();
            await using (DonationAppContext context = _db.NewContext())
            {
                context.AddRange(
                    NewPost(w, Start, "Urgente: SANGRE para Ana"),
                    NewPost(w, Start.AddHours(1), "Ayuda", description: "Se busca donante de sangre"),
                    NewPost(w, Start.AddHours(2), "Plaquetas", description: "-", bloodType: w.ONeg),
                    NewPost(w, Start.AddHours(3), "Medula", description: "-", donationType: w.Medula, priority: true),
                    NewPost(w, Start.AddHours(4), "Campana del centro", description: "-", centerId: w.Center.Id));
                await context.SaveChangesAsync();
            }

            Assert.Equal(2, (await Feed(new DonationPostQuery { Search = "  sangre " })).TotalCount);
            Assert.Equal("Plaquetas", Assert.Single((await Feed(new DonationPostQuery { BloodTypeId = w.ONeg.Id })).Items).Title);
            Assert.Equal("Medula", Assert.Single((await Feed(new DonationPostQuery { DonationTypeId = w.Medula.Id })).Items).Title);
            Assert.Equal("Medula", Assert.Single((await Feed(new DonationPostQuery { Priority = true })).Items).Title);
            Assert.Equal(4, (await Feed(new DonationPostQuery { Priority = false })).TotalCount);
            Assert.Equal("Campana del centro", Assert.Single((await Feed(new DonationPostQuery { DonationCenterId = w.Center.Id })).Items).Title);
            Assert.Equal(5, (await Feed(new DonationPostQuery { Search = "   " })).TotalCount);
        }

        [Fact(DisplayName = "User and center post lists are scoped by the route, not by the query")]
        public async Task ScopedPostLists()
        {
            User other = null!;
            World w = await SeedAsync(world =>
            {
                other = NewUser("Otro", world.APlus.Id);
                return new object[]
                {
                    other,
                    NewPost(world, Start, "Mio"),
                    NewPost(world, Start, "De otro", userId: other.Id),
                    NewPost(world, Start, "Del centro", centerId: world.Center.Id),
                };
            });

            DonationPostRepository repository = new DonationPostRepository(_db.NewContext());

            Assert.Equal("Mio", Assert.Single((await repository.GetByUser(w.Author.Id, new DonationPostQuery())).Items).Title);
            Assert.Equal("Del centro", Assert.Single((await repository.GetByDonationCenter(w.Center.Id,
                new DonationPostQuery { DonationCenterId = Guid.NewGuid() })).Items).Title);
        }

        // ---------- Users and donors ----------

        [Fact(DisplayName = "Users: ordered by name; search by name or email; city ignores case; blood type")]
        public async Task Users_FiltersAndOrder()
        {
            World w = await SeedAsync(world => new object[]
            {
                NewUser("Carla", world.ONeg.Id, "La Paz", "carla@hospital.bo"),
                NewUser("beto", world.APlus.Id, "la paz"),
                NewUser("Ana", world.APlus.Id, null),
            });
            UserRepository repository = new UserRepository(_db.NewContext(), null!);

            PagedResult<User> all = await repository.GetAll(new UserQuery());
            Assert.Equal(new[] { "Ana", "Autor", "beto", "Carla" }, all.Items.Select(u => u.FullName).OrderBy(n => n, StringComparer.OrdinalIgnoreCase));
            Assert.All(all.Items, u => Assert.NotNull(u.BloodType));

            Assert.Equal("Carla", Assert.Single((await repository.GetAll(new UserQuery { Search = "HOSPITAL" })).Items).FullName);
            Assert.Equal(2, (await repository.GetAll(new UserQuery { City = " LA PAZ " })).TotalCount);
            Assert.Equal("Carla", Assert.Single((await repository.GetAll(new UserQuery { BloodTypeId = w.ONeg.Id })).Items).FullName);
        }

        [Fact(DisplayName = "Donor directory: search is by name only, never by email")]
        public async Task Donors_SearchByNameOnly()
        {
            World w = await SeedAsync(world => new object[] { NewUser("Carla", world.ONeg.Id, "La Paz", "secret@hospital.bo") });
            UserRepository repository = new UserRepository(_db.NewContext(), null!);

            Assert.Empty((await repository.GetDirectoryAsync(new DonorQuery { Search = "hospital" })).Items);
            Assert.Equal("Carla", Assert.Single((await repository.GetDirectoryAsync(new DonorQuery { Search = "car" })).Items).FullName);
            Assert.Equal("Carla", Assert.Single((await repository.GetDirectoryAsync(new DonorQuery { BloodTypeId = w.ONeg.Id, City = "la paz" })).Items).FullName);
        }

        // ---------- Catalogs ----------

        [Fact(DisplayName = "Centers: search by name or address, filter by city and donation type, donation types included")]
        public async Task Centers_Filters()
        {
            World w = await SeedAsync(world => new object[]
            {
                NewCenter("Banco de Sangre Sur", "La Paz", "Calle Hospital 5", world.Sangre, world.Medula),
                NewCenter("Clinica Central", "Santa Cruz", "Av. Banzer"),
            });
            DonationCenterRepository repository = new DonationCenterRepository(_db.NewContext());

            Assert.Equal(new[] { "Banco de Sangre Sur", "Centro Norte", "Clinica Central" },
                (await repository.GetAll(new DonationCenterQuery())).Items.Select(c => c.Name));
            Assert.Equal("Banco de Sangre Sur", Assert.Single((await repository.GetAll(new DonationCenterQuery { Search = "hospital" })).Items).Name);
            Assert.Equal("Clinica Central", Assert.Single((await repository.GetAll(new DonationCenterQuery { City = "SANTA cruz" })).Items).Name);

            DonationCenter medula = Assert.Single((await repository.GetAll(new DonationCenterQuery { DonationTypeId = w.Medula.Id })).Items);
            Assert.Equal(2, medula.DonationCenterDonationTypes.Count);
            Assert.All(medula.DonationCenterDonationTypes, j => Assert.NotNull(j.DonationType));
        }

        [Fact(DisplayName = "Donation types: search by name; blood types: ordered by name and paged")]
        public async Task Catalogs()
        {
            await SeedAsync(world => new object[] { new BloodType { Id = Guid.NewGuid(), Name = "AB+", Image = "ab.png" } });

            PagedResult<DonationType> types = await new DonationTypeRepository(_db.NewContext()).GetAll(new DonationTypeQuery { Search = "MEDULA" });
            Assert.Equal("Medula Osea", Assert.Single(types.Items).Name);

            BloodTypeRepository bloodTypes = new BloodTypeRepository(_db.NewContext());
            PagedResult<BloodType> first = await bloodTypes.GetAll(new BloodTypeQuery { PageSize = 2 });
            Assert.Equal(new[] { "A+", "AB+" }, first.Items.Select(b => b.Name));
            Assert.Equal(3, first.TotalCount);
            Assert.Equal("O-", Assert.Single((await bloodTypes.GetAll(new BloodTypeQuery { PageSize = 2, Page = 2 })).Items).Name);
        }
    }
}
