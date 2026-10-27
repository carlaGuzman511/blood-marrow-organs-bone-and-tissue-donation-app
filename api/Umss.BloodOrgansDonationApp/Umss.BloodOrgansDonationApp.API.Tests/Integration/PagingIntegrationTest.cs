using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Umss.BloodOrgansDonationApp.API.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.API.Tests.Integration
{
    /// <summary>
    /// US-API-18 / US-API-26 through the real pipeline: every list endpoint returns one page plus
    /// totals, rejects bad paging with 400, and filters on the server. Each test starts its own API
    /// with its own database, so counts are exact.
    /// </summary>
    public class PagingIntegrationTest
    {
        private static readonly DateTime Start = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        private static readonly string[] PrivateFields = { "email", "phoneNumber", "address", "dateOfBirth", "latitude", "longitude", "password", "keycloakSubject" };

        /// <summary>The list endpoints and how to fill each with <c>count</c> rows. Returns the URL to call.</summary>
        public static TheoryData<string> Endpoints => new TheoryData<string>
        {
            "blood-types", "donation-types", "donation-centers", "donation-posts", "users", "donors",
            "user-posts", "center-posts", "comments",
        };

        private sealed class Seeded
        {
            public BloodType BloodType { get; } = new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "a.png" };
            public DonationType DonationType { get; } = NewDonationType("Sangre");
            public User Author { get; set; } = null!;
            public DonationCenter Center { get; set; } = null!;
            public DonationPost Post { get; set; } = null!;
        }

        private static DonationType NewDonationType(string name) => new DonationType
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

        private static User NewUser(string name, Guid bloodTypeId, string? city = "Cochabamba") => new User
        {
            Id = Guid.NewGuid(),
            FullName = name,
            Email = $"{Guid.NewGuid():N}@example.com",
            BloodTypeId = bloodTypeId,
            Address = "Calle Privada 123",
            City = city,
            Latitude = -17.4,
            Longitude = -66.2,
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            PhoneNumber = "+59170000000",
            Image = "u.png",
        };

        private static DonationCenter NewCenter(string name, string city = "Cochabamba") => new DonationCenter
        {
            Id = Guid.NewGuid(),
            Name = name,
            Address = "Av. 1",
            City = city,
            Email = "c@test.com",
            OpeningHours = "08-18",
            Phone = "4444444",
            Image = "c.png",
            Latitude = 0,
            Longitude = 0,
            DonationCenterDonationTypes = new List<DonationCenterDonationType>(),
        };

        private static DonationPost NewPost(Seeded s, int i, Guid? userId = null, Guid? centerId = null, BloodType? bloodType = null) => new DonationPost
        {
            Id = Guid.NewGuid(),
            Title = $"Post {i:00}",
            Description = "Urgente",
            Image = "p.png",
            BloodTypeId = (bloodType ?? s.BloodType).Id,
            DonationTypeId = s.DonationType.Id,
            UserId = centerId == null ? (userId ?? s.Author.Id) : null,
            DonationCenterId = centerId,
            CreatedAt = Start.AddMinutes(i),
        };

        /// <summary>Base rows (one blood type, donation type, author, center and post) plus <paramref name="count"/> rows of <paramref name="endpoint"/>.</summary>
        private static Task<(string Url, Seeded Data)> SeedAsync(ApiFactory api, string endpoint, int count) =>
            api.QueryDbAsync(async db =>
            {
                // The startup seed fails, but InMemory has no transactions: its blood types stay behind.
                db.BloodTypes.RemoveRange(db.BloodTypes);

                Seeded s = new Seeded();
                s.Author = NewUser("Autor", s.BloodType.Id);
                s.Center = NewCenter("Centro Base");
                s.Post = NewPost(s, -1);
                db.AddRange(s.BloodType, s.DonationType, s.Author, s.Center, s.Post);

                // The base rows already count once for some endpoints.
                int extra = endpoint switch
                {
                    "blood-types" or "donation-types" or "donation-centers" or "users" or "donors" or "donation-posts" or "user-posts" => count - 1,
                    _ => count,
                };

                string url = endpoint switch
                {
                    "user-posts" => $"/api/users/{s.Author.Id}/donation-posts",
                    "center-posts" => $"/api/donation-centers/{s.Center.Id}/donation-posts",
                    "comments" => $"/api/posts/{s.Post.Id}/comments",
                    _ => $"/api/{endpoint}",
                };

                for (int i = 0; i < extra; i++)
                {
                    object row = endpoint switch
                    {
                        "blood-types" => new BloodType { Id = Guid.NewGuid(), Name = $"T{i:00}", Image = "t.png" },
                        "donation-types" => NewDonationType($"Tipo {i:00}"),
                        "donation-centers" => NewCenter($"Centro {i:00}"),
                        "users" or "donors" => NewUser($"Usuario {i:00}", s.BloodType.Id),
                        "donation-posts" or "user-posts" => NewPost(s, i),
                        "center-posts" => NewPost(s, i, centerId: s.Center.Id),
                        "comments" => new Comment { Id = Guid.NewGuid(), DonationPostId = s.Post.Id, UserId = s.Author.Id, Description = $"c{i}", CreatedAt = Start.AddMinutes(i) },
                        _ => throw new ArgumentOutOfRangeException(nameof(endpoint)),
                    };
                    db.Add(row);
                }

                await db.SaveChangesAsync();
                return (url, s);
            });

        private static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response)
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            using JsonDocument doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return doc.RootElement.Clone();
        }

        private static int Count(JsonElement page) => page.GetProperty("items").GetArrayLength();

        // ---------- Every list endpoint ----------

        [Theory(DisplayName = "No paging params: the default page of 20 plus totals; page 2 has the rest")]
        [MemberData(nameof(Endpoints))]
        public async Task DefaultPage_AndSecondPage(string endpoint)
        {
            await using ApiFactory api = new ApiFactory();
            HttpClient client = api.CreateClient();
            (string url, _) = await SeedAsync(api, endpoint, 25);

            JsonElement first = await ReadJsonAsync(await client.GetAsync(url));
            JsonElement second = await ReadJsonAsync(await client.GetAsync($"{url}?page=2"));

            Assert.Equal(20, Count(first));
            Assert.Equal(1, first.GetProperty("page").GetInt32());
            Assert.Equal(20, first.GetProperty("pageSize").GetInt32());
            Assert.Equal(25, first.GetProperty("totalCount").GetInt32());
            Assert.Equal(2, first.GetProperty("totalPages").GetInt32());
            Assert.Equal(5, Count(second));

            JsonElement custom = await ReadJsonAsync(await client.GetAsync($"{url}?page=3&pageSize=10"));
            Assert.Equal(5, Count(custom));
        }

        [Theory(DisplayName = "Bad paging params are a 400 with a validation message for that parameter")]
        [InlineData("pageSize=-1", "PageSize")]
        [InlineData("pageSize=0", "PageSize")]
        [InlineData("pageSize=101", "PageSize")]
        [InlineData("page=0", "Page")]
        [InlineData("page=-3", "Page")]
        [InlineData("pageSize=abc", "PageSize")]
        public async Task InvalidPaging_Returns400(string queryString, string field)
        {
            await using ApiFactory api = new ApiFactory();
            HttpClient client = api.CreateClient();

            foreach (string url in new[] { "/api/blood-types", "/api/donation-types", "/api/donation-centers", "/api/donation-posts", "/api/users", "/api/donors" })
            {
                HttpResponseMessage response = await client.GetAsync($"{url}?{queryString}");

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
                using JsonDocument doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                Assert.Contains(doc.RootElement.GetProperty("errors").EnumerateObject(), e => e.Name.Equals(field, StringComparison.OrdinalIgnoreCase));
            }
        }

        [Fact(DisplayName = "A search longer than 100 characters is a 400")]
        public async Task LongSearch_Returns400()
        {
            await using ApiFactory api = new ApiFactory();

            HttpResponseMessage response = await api.CreateClient().GetAsync($"/api/donors?search={new string('a', 101)}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact(DisplayName = "An empty feed is 200 with no items (it used to be 204)")]
        public async Task EmptyFeed_Is200()
        {
            await using ApiFactory api = new ApiFactory();

            JsonElement page = await ReadJsonAsync(await api.CreateClient().GetAsync("/api/donation-posts"));

            Assert.Equal(0, Count(page));
            Assert.Equal(0, page.GetProperty("totalCount").GetInt32());
        }

        // ---------- Filters ----------

        [Fact(DisplayName = "Filters run on the server: donors by name/city, posts by blood type and text, centers by city")]
        public async Task Filters()
        {
            await using ApiFactory api = new ApiFactory();
            HttpClient client = api.CreateClient();
            (_, Seeded s) = await SeedAsync(api, "donation-posts", 3);
            BloodType oNeg = new BloodType { Id = Guid.NewGuid(), Name = "O-", Image = "o.png" };
            await api.QueryDbAsync(async db =>
            {
                db.AddRange(oNeg,
                    NewUser("Carla Rojas", oNeg.Id, "La Paz"),
                    NewCenter("Hospital Viedma", "Cochabamba"),
                    NewCenter("Banco de Sangre", "La Paz"),
                    NewPost(s, 100, bloodType: oNeg));
                return await db.SaveChangesAsync();
            });

            JsonElement donors = await ReadJsonAsync(await client.SendAs(TestIdentity.Donor(), HttpMethod.Get, "/api/donors?search=CARLA&city=la%20paz"));
            Assert.Equal("Carla Rojas", Assert.Single(donors.GetProperty("items").EnumerateArray()).GetProperty("fullName").GetString());

            JsonElement posts = await ReadJsonAsync(await client.GetAsync($"/api/donation-posts?bloodTypeId={oNeg.Id}&search=post%20100"));
            Assert.Equal("Post 100", Assert.Single(posts.GetProperty("items").EnumerateArray()).GetProperty("title").GetString());

            JsonElement centers = await ReadJsonAsync(await client.GetAsync("/api/donation-centers?city=LA%20PAZ"));
            Assert.Equal("Banco de Sangre", Assert.Single(centers.GetProperty("items").EnumerateArray()).GetProperty("name").GetString());
        }

        // ---------- Access and privacy stay as they were ----------

        [Fact(DisplayName = "Paging doesn't change access: users stay admin-only (403 before validation), no token is 401")]
        public async Task AccessUnchanged()
        {
            await using ApiFactory api = new ApiFactory();
            HttpClient client = api.CreateClient();

            Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAs(TestIdentity.Donor(), HttpMethod.Get, "/api/users?page=1")).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAs(TestIdentity.Donor(), HttpMethod.Get, "/api/users?pageSize=-1")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAs(TestIdentity.Anonymous, HttpMethod.Get, "/api/donation-posts?page=1")).StatusCode);
        }

        [Fact(DisplayName = "Feed and comments show authors with public fields only (no email, phone, address, birth date, location)")]
        public async Task Authors_PublicFieldsOnly()
        {
            await using ApiFactory api = new ApiFactory();
            HttpClient client = api.CreateClient();
            (string commentsUrl, Seeded s) = await SeedAsync(api, "comments", 2);

            HttpResponseMessage feed = await client.SendAs(TestIdentity.Donor(), HttpMethod.Get, "/api/donation-posts");
            HttpResponseMessage comments = await client.SendAs(TestIdentity.Donor(), HttpMethod.Get, commentsUrl);
            HttpResponseMessage userPosts = await client.SendAs(TestIdentity.Donor(), HttpMethod.Get, $"/api/users/{s.Author.Id}/donation-posts");

            foreach (HttpResponseMessage response in new[] { feed, comments, userPosts })
            {
                string json = await response.Content.ReadAsStringAsync();
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Contains("\"Autor\"", json);
                foreach (string field in PrivateFields)
                {
                    Assert.DoesNotContain($"\"{field}\"", json, StringComparison.OrdinalIgnoreCase);
                }
            }

            JsonElement post = Assert.Single((await ReadJsonAsync(feed)).GetProperty("items").EnumerateArray());
            Assert.Equal(2, post.GetProperty("commentCount").GetInt32());
        }

        // ---------- Swagger ----------

        [Fact(DisplayName = "Swagger documents page, pageSize and the filters (camelCase, with descriptions) and the page shape")]
        public async Task Swagger_DocumentsPaging()
        {
            await using ApiFactory api = new ApiFactory();
            JsonElement doc = await ReadJsonAsync(await api.CreateClient().SendAs(TestIdentity.Anonymous, HttpMethod.Get, "/swagger/v1/swagger.json"));

            JsonElement feed = doc.GetProperty("paths").GetProperty("/api/donation-posts").GetProperty("get");
            Dictionary<string, JsonElement> parameters = feed.GetProperty("parameters").EnumerateArray()
                .ToDictionary(p => p.GetProperty("name").GetString()!, p => p);

            foreach (string name in new[] { "page", "pageSize", "search", "bloodTypeId", "donationTypeId", "donationCenterId", "priority" })
            {
                Assert.True(parameters.ContainsKey(name), $"missing query parameter {name}");
                Assert.Equal("query", parameters[name].GetProperty("in").GetString());
            }

            Assert.Contains("1 to 100", parameters["pageSize"].GetProperty("description").GetString());
            Assert.True(feed.GetProperty("responses").TryGetProperty("400", out _));

            // The 200 response is the page shape, whatever name Swashbuckle gives the schema.
            string reference = feed.GetProperty("responses").GetProperty("200").GetProperty("content")
                .EnumerateObject().First().Value.GetProperty("schema").GetProperty("$ref").GetString()!;
            JsonElement paged = doc.GetProperty("components").GetProperty("schemas")
                .GetProperty(reference.Split('/').Last()).GetProperty("properties");
            foreach (string property in new[] { "items", "page", "pageSize", "totalCount", "totalPages" })
            {
                Assert.True(paged.TryGetProperty(property, out _), $"missing {property}");
            }
        }
    }
}
