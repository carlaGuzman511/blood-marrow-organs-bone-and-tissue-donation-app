using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.Repository.Tests.Postgres
{
    /// <summary>
    /// US-API-18 on a real Postgres (see <see cref="PostgresFactAttribute"/>): what InMemory can't
    /// prove about the SQL that paging and search produce.
    /// </summary>
    public class PostgresPagingTest : IAsyncLifetime
    {
        private readonly DbContextOptions<DonationAppContext> _options;
        private static bool Enabled => Environment.GetEnvironmentVariable(PostgresFactAttribute.Variable) != null;

        public PostgresPagingTest()
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
            if (Enabled)
            {
                await using DonationAppContext context = new DonationAppContext(_options);
                await context.Database.MigrateAsync();
            }
        }

        public async Task DisposeAsync()
        {
            if (Enabled)
            {
                await using DonationAppContext context = new DonationAppContext(_options);
                await context.Database.EnsureDeletedAsync();
            }
        }

        private DonationAppContext NewContext() => new DonationAppContext(_options);

        /// <summary>A user with one post per title, created one minute apart, each post with two comments.</summary>
        private async Task SeedPostsAsync(params string[] titles)
        {
            await using DonationAppContext context = NewContext();
            BloodType bloodType = new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "a.png" };
            DonationType donationType = new DonationType
            {
                Id = Guid.NewGuid(),
                Name = "Sangre",
                Description = "-",
                Requirements = "-",
                Process = "-",
                Importance = "-",
                Benefits = "-",
                SecondaryEffects = "-",
                Image = "s.png",
            };
            User user = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Autor",
                Email = "autor@example.com",
                BloodTypeId = bloodType.Id,
                Address = "Calle 1",
                Latitude = 0,
                Longitude = 0,
                Image = "u.png",
                DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            };
            context.AddRange(bloodType, donationType, user);

            DateTime start = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            for (int i = 0; i < titles.Length; i++)
            {
                DonationPost post = new DonationPost
                {
                    Id = Guid.NewGuid(),
                    Title = titles[i],
                    Description = "-",
                    Image = "p.png",
                    BloodTypeId = bloodType.Id,
                    DonationTypeId = donationType.Id,
                    UserId = user.Id,
                    CreatedAt = start.AddMinutes(i),
                };
                context.Add(post);
                context.AddRange(Enumerable.Range(0, 2).Select(c => new Comment
                {
                    Id = Guid.NewGuid(),
                    DonationPostId = post.Id,
                    UserId = user.Id,
                    Description = $"c{c}",
                    CreatedAt = start,
                }));
            }

            await context.SaveChangesAsync();
        }

        private async Task<PagedResult<DonationPost>> FeedAsync(DonationPostQuery query)
        {
            await using DonationAppContext context = NewContext();
            return await new DonationPostRepository(context).Get(query);
        }

        [PostgresFact(DisplayName = "Postgres: search treats % and _ as plain text and ignores case")]
        public async Task Search_IsLiteral()
        {
            await SeedPostsAsync("Meta al 100% cubierta", "grupo a_b", "grupo axb", "URGENTE sangre");

            Assert.Equal("Meta al 100% cubierta", Assert.Single((await FeedAsync(new DonationPostQuery { Search = "%" })).Items).Title);
            Assert.Equal("grupo a_b", Assert.Single((await FeedAsync(new DonationPostQuery { Search = "a_b" })).Items).Title);
            Assert.Equal("URGENTE sangre", Assert.Single((await FeedAsync(new DonationPostQuery { Search = "urgente" })).Items).Title);
        }

        [PostgresFact(DisplayName = "Postgres: a split-query feed page has the right posts, totals and comments")]
        public async Task Feed_SplitQueryPage()
        {
            await SeedPostsAsync(Enumerable.Range(0, 7).Select(i => $"Post {i}").ToArray());

            PagedResult<DonationPost> page = await FeedAsync(new DonationPostQuery { Page = 2, PageSize = 3 });

            Assert.Equal(7, page.TotalCount);
            Assert.Equal(new[] { "Post 3", "Post 2", "Post 1" }, page.Items.Select(p => p.Title));
            Assert.All(page.Items, p => Assert.Equal(2, p.Comments.Count));
            Assert.All(page.Items, p => Assert.Equal("Autor", p.User?.FullName));
        }

        [PostgresFact(DisplayName = "Postgres (US-API-26): every query of a feed page is limited in SQL; the total is a COUNT")]
        public async Task Feed_PagesInSql()
        {
            await SeedPostsAsync(Enumerable.Range(0, 30).Select(i => $"Post {i}").ToArray());

            List<string> sql = new List<string>();
            DbContextOptions<DonationAppContext> logged = new DbContextOptionsBuilder<DonationAppContext>(_options)
                .LogTo(message => sql.Add(message), new[] { RelationalEventId.CommandExecuted })
                .Options;

            await using DonationAppContext context = new DonationAppContext(logged);
            PagedResult<DonationPost> page = await new DonationPostRepository(context).Get(new DonationPostQuery { Page = 3, PageSize = 5 });

            Assert.Equal(5, page.Items.Count);
            Assert.Equal(30, page.TotalCount);
            Assert.Contains(sql, s => s.Contains("count(*)", StringComparison.OrdinalIgnoreCase));

            // The posts query and each split query (comments, ...) must read only the page, never the table.
            List<string> reads = sql.Where(s => s.Contains("\"DonationPosts\"") && !s.Contains("count(*)", StringComparison.OrdinalIgnoreCase)).ToList();
            Assert.NotEmpty(reads);
            Assert.All(reads, s => Assert.Contains("LIMIT", s));
            Assert.All(reads, s => Assert.Contains("OFFSET", s));
        }

        [PostgresFact(DisplayName = "Postgres: a post's comments are paged oldest first, with their authors")]
        public async Task Comments_Paged()
        {
            await SeedPostsAsync("Con comentarios");
            Guid postId;
            await using (DonationAppContext context = NewContext())
            {
                postId = (await context.DonationPosts.SingleAsync()).Id;
            }

            await using DonationAppContext read = NewContext();
            PagedResult<Comment> first = await new CommentRepository(read).Get(postId, new CommentQuery { PageSize = 1 });

            Assert.Equal(2, first.TotalCount);
            Assert.Equal("Autor", Assert.Single(first.Items).User.FullName);
        }

        [PostgresFact(DisplayName = "Postgres: the feed order has its index (IX_DonationPosts_CreatedAt_Id)")]
        public async Task FeedIndexExists()
        {
            await using DonationAppContext context = NewContext();
            List<string> indexes = await context.Database
                .SqlQueryRaw<string>("SELECT indexname AS \"Value\" FROM pg_indexes WHERE tablename = 'DonationPosts'")
                .ToListAsync();

            Assert.Contains("IX_DonationPosts_CreatedAt_Id", indexes);
        }
    }
}
