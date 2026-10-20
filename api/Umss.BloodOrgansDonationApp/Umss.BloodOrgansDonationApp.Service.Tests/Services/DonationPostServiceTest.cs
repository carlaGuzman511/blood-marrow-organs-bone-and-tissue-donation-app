using Moq;
using System.Threading.Tasks;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Service.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Services;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    public class DonationPostServiceTest : IClassFixture<RepositoryFixture>
    {
        private readonly DonationPostService donationPostService;
        private readonly RepositoryFixture repositoryFixture;

        public DonationPostServiceTest(RepositoryFixture repositoryFixture)
        {
            this.repositoryFixture = repositoryFixture;
            this.donationPostService = new DonationPostService(this.repositoryFixture.DonationPostRepository, this.repositoryFixture.Mapper, this.repositoryFixture.CurrentUserService);
        }
        private IEnumerable<DonationPost> GetDonationPosts()
        {
            DonationPost[] donationPosts = new DonationPost[8]
            {
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
                new DonationPost {Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty },
            };

            return donationPosts;
        }

        private DonationPost GetDonationPost()
        {
            DonationPost donationPost = new DonationPost { Id = Guid.NewGuid(), BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid(), UserId = Guid.NewGuid(), DonationCenterId = Guid.NewGuid(), CreatedAt = DateTime.Now, Description = "Se busca donante de sangre tipo: O-", Image = String.Empty };

            return donationPost;
        }

        private DonationPostRequest GetDonationPostRequest()
        {
            DonationPostRequest donationPostRequest = new DonationPostRequest()
            {
                BloodTypeId = Guid.NewGuid(),
                DonationTypeId = Guid.NewGuid(),
                Title = "Donantes O-",
                Description = "Se necesita sangre tipo: O-",
                Image = "post.png",
            };

            return donationPostRequest;
        }

        [Fact]
        public async Task GetByDonationCenterId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.GetByDonationCenter(It.IsAny<Guid>(), It.IsAny<DonationPostQuery>())).ReturnsAsync(Paged.Of(this.GetDonationPosts()));
            PagedResult<DonationPostResponse> donationPosts = await this.donationPostService.GetByDonationCenter(Guid.NewGuid(), new DonationPostQuery());

            Assert.NotEmpty(donationPosts.Items);
        }

        [Fact]
        public async Task GetByUserId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.GetByUser(It.IsAny<Guid>(), It.IsAny<DonationPostQuery>())).ReturnsAsync(Paged.Of(this.GetDonationPosts()));
            PagedResult<DonationPostResponse> donationPosts = await this.donationPostService.GetByUser(Guid.NewGuid(), new DonationPostQuery());

            Assert.NotEmpty(donationPosts.Items);
        }

        [Fact]
        public async Task GetByDonationCenterIdAndPostId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.GetByDonationCenter(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(this.GetDonationPost());
            DonationPostResponse? donationPost = await this.donationPostService.GetByDonationCenter(Guid.NewGuid(), Guid.NewGuid());

            Assert.NotNull(donationPost);
        }

        [Fact]
        public async Task GetByUserIdAndPostId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.GetByUser(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(this.GetDonationPost());
            DonationPostResponse? donationPost = await this.donationPostService.GetByUser(Guid.NewGuid(), Guid.NewGuid());

            Assert.NotNull(donationPost);
        }

        [Fact]
        public async Task CreateByDonationCenterId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.Create(It.IsAny<DonationPost>())).ReturnsAsync(this.GetDonationPost());
            DonationPostResponse donationPost = await this.donationPostService.CreateByDonationCenter(Guid.NewGuid(), this.GetDonationPostRequest());

            Assert.NotNull(donationPost);
        }

        [Fact]
        public async Task CreateByUserId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.Create(It.IsAny<DonationPost>())).ReturnsAsync(this.GetDonationPost());
            DonationPostResponse donationPost = await this.donationPostService.CreateByUser(Guid.NewGuid(), this.GetDonationPostRequest());

            Assert.NotNull(donationPost);
        }

        [Fact]
        public async Task DeleteByUserId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.DeleteByUser(It.IsAny<Guid>(), It.IsAny<Guid>()));
            await this.donationPostService.DeleteByUser(Guid.NewGuid(), Guid.NewGuid());
        }

        [Fact]
        public async Task DeleteByDonationCenterId()
        {
            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.DeleteByDonationCenter(It.IsAny<Guid>(), It.IsAny<Guid>()));
            await this.donationPostService.DeleteByDonationCenter(Guid.NewGuid(), Guid.NewGuid());
        }

        [Fact]
        public async Task UpdateByDonationCenterId()
        {
            Guid donationCenterId = Guid.NewGuid();
            DonationPost existing = this.GetDonationPost();
            DonationPost refreshed = this.GetDonationPost();
            DonationPost? saved = null;
            DonationPostResponse expected = new DonationPostResponse { Id = refreshed.Id, Description = refreshed.Description, Image = refreshed.Image };

            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.GetByDonationCenter(donationCenterId, existing.Id)).ReturnsAsync(existing);
            this.repositoryFixture.DonationPostRepositoryMock
                .Setup(x => x.Update(It.Is<DonationPost>(p => p.Id == existing.Id)))
                .Callback<DonationPost>(p => saved = p)
                .ReturnsAsync(refreshed);
            this.repositoryFixture.MapperMock.Setup(x => x.Map<DonationPostResponse>(refreshed)).Returns(expected);

            DonationPostResponse response = await this.donationPostService.UpdateByDonationCenter(donationCenterId, existing.Id, this.GetDonationPostRequest());

            // The response must come from the entity the repository returned (reloaded navigations).
            Assert.Same(expected, response);
            Assert.NotNull(saved);
            Assert.Equal(donationCenterId, saved!.DonationCenterId);
            Assert.Equal(DateTimeKind.Utc, saved.UpdatedAt.Kind);
        }

        [Fact]
        public async Task UpdateByUserId()
        {
            Guid userId = Guid.NewGuid();
            DonationPost existing = this.GetDonationPost();
            DonationPost refreshed = this.GetDonationPost();
            DonationPost? saved = null;
            DonationPostResponse expected = new DonationPostResponse { Id = refreshed.Id, Description = refreshed.Description, Image = refreshed.Image };

            this.repositoryFixture.DonationPostRepositoryMock.Setup(x => x.GetByUser(userId, existing.Id)).ReturnsAsync(existing);
            this.repositoryFixture.DonationPostRepositoryMock
                .Setup(x => x.Update(It.Is<DonationPost>(p => p.Id == existing.Id)))
                .Callback<DonationPost>(p => saved = p)
                .ReturnsAsync(refreshed);
            this.repositoryFixture.MapperMock.Setup(x => x.Map<DonationPostResponse>(refreshed)).Returns(expected);

            DonationPostResponse response = await this.donationPostService.UpdateByUser(userId, existing.Id, this.GetDonationPostRequest());

            Assert.Same(expected, response);
            Assert.NotNull(saved);
            Assert.Equal(userId, saved!.UserId);
            // Npgsql rejects DateTimeKind.Local for "timestamp with time zone" columns.
            Assert.Equal(DateTimeKind.Utc, saved.UpdatedAt.Kind);
        }
    }
}
