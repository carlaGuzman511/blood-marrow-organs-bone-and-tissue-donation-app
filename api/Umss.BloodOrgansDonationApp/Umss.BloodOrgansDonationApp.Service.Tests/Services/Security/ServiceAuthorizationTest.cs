using AutoMapper;
using Moq;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.AutoMapper;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Services;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services.Security
{
    /// <summary>
    /// The caller checks inside the services (US-API-12): they hold even if a controller forgets an attribute.
    /// Uses a fresh non-admin caller per test, unlike the shared RepositoryFixture, which acts as an admin.
    /// </summary>
    public class ServiceAuthorizationTest
    {
        private readonly Mock<ICurrentUserService> _donor = new Mock<ICurrentUserService>();
        private readonly IMapper _mapper = new MapperConfiguration(cfg => cfg.AddMaps(typeof(CommentProfile).Assembly)).CreateMapper();

        public ServiceAuthorizationTest()
        {
            _donor.SetupGet(c => c.IsNetworkAdmin).Returns(false);
            _donor.Setup(c => c.EnsureSelfOrAdminAsync(It.IsAny<Guid>())).ThrowsAsync(new ForbiddenException("not yours"));
        }

        private static User Profile(Guid id) => new User
        {
            Id = id,
            FullName = "x",
            BloodTypeId = Guid.NewGuid(),
            Latitude = 0,
            Longitude = 0,
            Image = "x",
        };

        [Fact(DisplayName = "UserService: a donor cannot list or delete users")]
        public async Task UserService_AdminOnly()
        {
            Mock<IUserRepository> users = new Mock<IUserRepository>();
            UserService service = new UserService(users.Object, _mapper, Mock.Of<ITokenService>(), _donor.Object);

            await Assert.ThrowsAsync<ForbiddenException>(() => service.GetAll(new UserQuery()));
            await Assert.ThrowsAsync<ForbiddenException>(() => service.Delete(Guid.NewGuid()));
            users.Verify(r => r.GetAll(It.IsAny<UserQuery>()), Times.Never);
            users.Verify(r => r.Delete(It.IsAny<Guid>()), Times.Never);
        }

        [Fact(DisplayName = "UserService: reading or updating someone else's profile is forbidden before any data access")]
        public async Task UserService_SelfOnly()
        {
            Mock<IUserRepository> users = new Mock<IUserRepository>(MockBehavior.Strict);
            UserService service = new UserService(users.Object, _mapper, Mock.Of<ITokenService>(), _donor.Object);

            await Assert.ThrowsAsync<ForbiddenException>(() => service.Get(Guid.NewGuid()));
            await Assert.ThrowsAsync<ForbiddenException>(() => service.Update(Guid.NewGuid(), new UserRequest
            {
                FullName = "x",
                Email = "x@x.com",
                Password = "x",
                Address = "x",
                PhoneNumber = "x",
                Image = "x",
                Latitude = 0,
                Longitude = 0,
            }));
        }

        [Fact(DisplayName = "DonationPostService: writing under another user's id is forbidden and nothing is saved")]
        public async Task DonationPostService_ByUserWrites()
        {
            Mock<IDonationPostRepository> posts = new Mock<IDonationPostRepository>(MockBehavior.Strict);
            DonationPostService service = new DonationPostService(posts.Object, _mapper, _donor.Object);
            DonationPostRequest request = new DonationPostRequest { Description = "d", Title = "t", Image = "i", BloodTypeId = Guid.NewGuid(), DonationTypeId = Guid.NewGuid() };

            await Assert.ThrowsAsync<ForbiddenException>(() => service.CreateByUser(Guid.NewGuid(), request));
            await Assert.ThrowsAsync<ForbiddenException>(() => service.UpdateByUser(Guid.NewGuid(), Guid.NewGuid(), request));
            await Assert.ThrowsAsync<ForbiddenException>(() => service.DeleteByUser(Guid.NewGuid(), Guid.NewGuid()));
        }

        [Fact(DisplayName = "CommentService: the author is the caller, not the UserId in the body")]
        public async Task CommentService_AuthorFromCaller()
        {
            Guid callerId = Guid.NewGuid();
            _donor.Setup(c => c.RequireProfileIdAsync()).ReturnsAsync(callerId);
            Mock<ICommentRepository> comments = new Mock<ICommentRepository>();
            Comment? saved = null;
            comments.Setup(r => r.Create(It.IsAny<Comment>())).Callback<Comment>(c => saved = c).ReturnsAsync((Comment c) => c);
            CommentService service = new CommentService(comments.Object, _mapper, _donor.Object);

            await service.Create(Guid.NewGuid(), new CommentRequest { Description = "hola", UserId = Guid.NewGuid() });

            Assert.Equal(callerId, saved!.UserId);
        }

        [Fact(DisplayName = "CommentService: only the author can edit or delete a comment")]
        public async Task CommentService_AuthorOnly()
        {
            Guid postId = Guid.NewGuid();
            Comment comment = new Comment { Id = Guid.NewGuid(), DonationPostId = postId, UserId = Guid.NewGuid(), Description = "x" };
            Mock<ICommentRepository> comments = new Mock<ICommentRepository>();
            comments.Setup(r => r.Get(postId, comment.Id)).ReturnsAsync(comment);
            _donor.Setup(c => c.GetProfileAsync()).ReturnsAsync(Profile(Guid.NewGuid()));
            CommentService service = new CommentService(comments.Object, _mapper, _donor.Object);

            await Assert.ThrowsAsync<ForbiddenException>(() => service.Update(postId, comment.Id, new CommentRequest { Description = "edit" }));
            await Assert.ThrowsAsync<ForbiddenException>(() => service.Delete(postId, comment.Id));
            comments.Verify(r => r.Update(It.IsAny<Comment>()), Times.Never);
            comments.Verify(r => r.Delete(It.IsAny<Guid>(), It.IsAny<Guid>()), Times.Never);
        }

        [Fact(DisplayName = "CommentService: the author can edit their own comment")]
        public async Task CommentService_AuthorCanEdit()
        {
            Guid postId = Guid.NewGuid();
            Guid authorId = Guid.NewGuid();
            Comment comment = new Comment { Id = Guid.NewGuid(), DonationPostId = postId, UserId = authorId, Description = "x" };
            Mock<ICommentRepository> comments = new Mock<ICommentRepository>();
            comments.Setup(r => r.Get(postId, comment.Id)).ReturnsAsync(comment);
            comments.Setup(r => r.Update(It.IsAny<Comment>())).ReturnsAsync((Comment c) => c);
            _donor.Setup(c => c.GetProfileAsync()).ReturnsAsync(Profile(authorId));
            CommentService service = new CommentService(comments.Object, _mapper, _donor.Object);

            await service.Update(postId, comment.Id, new CommentRequest { Description = "edit" });

            comments.Verify(r => r.Update(It.IsAny<Comment>()), Times.Once);
        }
    }
}
