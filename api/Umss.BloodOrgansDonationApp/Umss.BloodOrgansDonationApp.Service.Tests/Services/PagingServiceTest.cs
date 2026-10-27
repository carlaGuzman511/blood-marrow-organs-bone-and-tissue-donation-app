using AutoMapper;
using FluentValidation;
using Moq;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.AutoMapper;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Service.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Services;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    /// <summary>US-API-18: paging is validated before the database is touched, and pages keep their totals when mapped.</summary>
    public class PagingServiceTest
    {
        private readonly IMapper _mapper = new MapperConfiguration(c =>
        {
            c.AddProfile<UserProfile>();
            c.AddProfile<DonationPostProfile>();
        }).CreateMapper();

        [Theory(DisplayName = "Paging limits: page >= 1, pageSize 1..100, search up to 100 characters")]
        [InlineData(1, 1, null, true)]
        [InlineData(1, 100, null, true)]
        [InlineData(999999, 20, "", true)]
        [InlineData(0, 20, null, false)]
        [InlineData(-1, 20, null, false)]
        [InlineData(1, 0, null, false)]
        [InlineData(1, -5, null, false)]
        [InlineData(1, 101, null, false)]
        [InlineData(1, 20, "x100", false)]
        public async Task Limits(int page, int pageSize, string? search, bool valid)
        {
            if (search == "x100")
            {
                search = new string('x', SearchPageQuery.MaxSearchLength + 1);
            }

            Mock<IUserRepository> users = new Mock<IUserRepository>();
            users.Setup(r => r.GetDirectoryAsync(It.IsAny<DonorQuery>())).ReturnsAsync(Paged.Of(Array.Empty<User>()));
            DonorService service = new DonorService(users.Object, _mapper);
            DonorQuery query = new DonorQuery { Page = page, PageSize = pageSize, Search = search };

            if (valid)
            {
                await service.GetAll(query);
                users.Verify(r => r.GetDirectoryAsync(query), Times.Once);
            }
            else
            {
                await Assert.ThrowsAsync<ValidationException>(() => service.GetAll(query));
                users.Verify(r => r.GetDirectoryAsync(It.IsAny<DonorQuery>()), Times.Never);
            }
        }

        [Fact(DisplayName = "Mapping a page keeps page, size and totals")]
        public async Task Map_KeepsTotals()
        {
            Mock<IDonationPostRepository> posts = new Mock<IDonationPostRepository>();
            posts.Setup(r => r.Get(It.IsAny<DonationPostQuery>())).ReturnsAsync(new PagedResult<DonationPost>
            {
                Items = new[] { new DonationPost { Id = Guid.NewGuid(), Description = "d", Image = "i", Comments = new List<Models.Entities.Comment>() } },
                Page = 3,
                PageSize = 1,
                TotalCount = 7,
            });
            DonationPostService service = new DonationPostService(posts.Object, _mapper, Mock.Of<Umss.BloodOrgansDonationApp.Services.Interfaces.ICurrentUserService>());

            PagedResult<DonationPostResponse> page = await service.Get(new DonationPostQuery { Page = 3, PageSize = 1 });

            Assert.Single(page.Items);
            Assert.Equal(3, page.Page);
            Assert.Equal(1, page.PageSize);
            Assert.Equal(7, page.TotalCount);
            Assert.Equal(7, page.TotalPages);
        }
    }
}
