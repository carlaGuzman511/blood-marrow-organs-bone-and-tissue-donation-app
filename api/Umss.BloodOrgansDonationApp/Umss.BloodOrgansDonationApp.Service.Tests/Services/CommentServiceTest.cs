using Moq;
using System.Threading.Tasks;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Service.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Services;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    public class CommentServiceTest : IClassFixture<RepositoryFixture>
    {
        private readonly RepositoryFixture repositoryFixture;
        private readonly CommentService commentService;
        public CommentServiceTest(RepositoryFixture repositoryFixture)
        {
            this.repositoryFixture = repositoryFixture;
            this.commentService = new CommentService(repositoryFixture.CommentRepository, repositoryFixture.Mapper);
        }
        private IEnumerable<Comment> GetComments()
        {
            User user = new User
            {
                FullName = "Juan Perez",
                BloodType = new BloodType
                {
                    Id = Guid.NewGuid(),
                    Name = "O-",
                    Image = string.Empty,
                },
                BloodTypeId = Guid.NewGuid(),
                Address = "Av America",
                Latitude = 11.1212,
                Longitude = 1.4787,
                DateOfBirth = DateTime.UtcNow,
                Image = string.Empty,
                DonationPosts = new List<DonationPost>()
            };

            Comment[] comments = new Comment[8] {
                new Comment { Id = Guid.NewGuid(), Description = "First Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },   
                new Comment { Id = Guid.NewGuid(), Description = "Second Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },
                new Comment { Id = Guid.NewGuid(), Description = "Third Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },
                new Comment { Id = Guid.NewGuid(), Description = "Fourth Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now , UserId = Guid.NewGuid(), User = user},
                new Comment { Id = Guid.NewGuid(), Description = "Fifth Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },
                new Comment { Id = Guid.NewGuid(), Description = "Sixth Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },
                new Comment { Id = Guid.NewGuid(), Description = "Seventh Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },
                new Comment { Id = Guid.NewGuid(), Description = "Eight Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user },
            };

            return comments;
        }

        private Comment GetComment()
        {
            User user = new User
            {
                FullName = "Juan Perez",
                BloodType = new BloodType
                {
                    Id = Guid.NewGuid(),
                    Name = "O-",
                    Image = string.Empty,
                },
                BloodTypeId = Guid.NewGuid(),
                Address = "Av America",
                Latitude = 11.1212,
                Longitude = 1.4787,
                DateOfBirth = DateTime.UtcNow,
                Image = string.Empty,
                DonationPosts = new List<DonationPost>()
            };

            Comment comment = new Comment { Id = Guid.NewGuid(), Description = "First Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now, UserId = Guid.NewGuid(), User = user };

            return comment;
        }
        private IEnumerable<CommentResponse> GetCommentResponses()
        {
            CommentResponse[] comments = new CommentResponse[8] {
                new CommentResponse { Id = Guid.NewGuid(), Description = "First Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Second Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Third Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Fourth Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Fifth Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Sixth Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Seventh Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
                new CommentResponse { Id = Guid.NewGuid(), Description = "Eight Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now },
            };

            return comments;
        }

        private CommentResponse GetCommentResponse()
        {
            CommentResponse comment = new CommentResponse { Id = Guid.NewGuid(), Description = "First Comment", DonationPostId = Guid.NewGuid(), CreatedAt = DateTime.Now };

            return comment;
        }
        private CommentRequest GetCommentRequest()
        {
            var commentRequest = new CommentRequest
            {
                Description = "New Comment",
            };

            return commentRequest;
        }

        [Fact]
        public async Task GetAll()
        {
            this.repositoryFixture.CommentRepositoryMock.Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync(this.GetComments());
            IEnumerable<CommentResponse> comments = await this.commentService.Get(It.IsAny<Guid>());

            Assert.NotEmpty(comments);
        }

        [Fact]
        public async Task GetById()
        {
            this.repositoryFixture.CommentRepositoryMock.Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(this.GetComment());
            this.repositoryFixture.MapperMock.Setup(x => x.Map<CommentResponse>(It.IsAny<Comment>())).Returns(this.GetCommentResponse());

            CommentResponse? comment = await this.commentService.Get(Guid.NewGuid(), Guid.NewGuid());

            Assert.NotNull(comment);
        }

        [Fact]
        public async Task Create()
        {
            this.repositoryFixture.MapperMock.Setup(x => x.Map<Comment>(It.IsAny<CommentRequest>())).Returns(this.GetComment());
            this.repositoryFixture.CommentRepositoryMock.Setup(x => x.Create(It.IsAny<Comment>())).ReturnsAsync(this.GetComment);
            this.repositoryFixture.MapperMock.Setup(x => x.Map<CommentResponse>(It.IsAny<Comment>())).Returns(this.GetCommentResponse());

            CommentResponse commentResponse = await this.commentService.Create(Guid.NewGuid(), this.GetCommentRequest());

            Assert.NotNull(commentResponse);
        }

        [Fact]
        public async Task Delete()
        {
            this.repositoryFixture.CommentRepositoryMock.Setup(x => x.Delete(It.IsAny<Guid>(), It.IsAny<Guid>()));
            await this.commentService.Delete(Guid.NewGuid(), Guid.NewGuid());
        }

        [Fact]
        public async Task Update()
        {
            this.repositoryFixture.CommentRepositoryMock.Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(this.GetComment);
            this.repositoryFixture.MapperMock.Setup(x => x.Map<Comment>(It.IsAny<CommentRequest>())).Returns(this.GetComment());
            this.repositoryFixture.CommentRepositoryMock.Setup(x => x.Update(It.IsAny<Comment>())).ReturnsAsync(this.GetComment);
            this.repositoryFixture.MapperMock.Setup(x => x.Map<CommentResponse>(It.IsAny<Comment>())).Returns(this.GetCommentResponse());

            CommentResponse commentResponse = await this.commentService.Update(Guid.NewGuid(), Guid.NewGuid(), this.GetCommentRequest());

            Assert.NotNull(commentResponse);
        }
    }
}
