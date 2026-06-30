using Moq;
using FluentValidation;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Service.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Services;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    public class BloodTypeServiceTest : IClassFixture<RepositoryFixture>
    {
        private readonly BloodTypeService bloodTypeService;
        private readonly RepositoryFixture repositoryFixture;
        public BloodTypeServiceTest(RepositoryFixture repositoryFixture)
        {
            this.repositoryFixture = repositoryFixture;
            this.bloodTypeService = new BloodTypeService(repositoryFixture.BloodTypeRepository, repositoryFixture.Mapper);
        }
        private IEnumerable<BloodType> GetBloodTypes()
        {
            BloodType[] bloodTypes = new BloodType[8] {
                new BloodType { Id = Guid.NewGuid(), Name = "O-", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "O+", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "A-", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "B-", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "B+", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "AB-", Image = "img.png" },
                new BloodType { Id = Guid.NewGuid(), Name = "AB+", Image = "img.png" },
            };

            return bloodTypes;
        }

        private BloodType GetBloodType()
        {
            BloodType bloodType = new BloodType { Id = Guid.NewGuid(), Name = "O-", Image = "img.png" };

            return bloodType;
        }

        [Fact]
        public async Task Create_Success_NewBloodTypeCreated()
        {
            BloodTypeRequest request = new BloodTypeRequest { Name = "O-", Image = "img.png" };

            this.repositoryFixture.MapperMock
                .Setup(m => m.Map<BloodType>(It.IsAny<BloodTypeRequest>()))
                .Returns((BloodTypeRequest src) => new BloodType { Name = src.Name, Image = src.Image });

            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Create(It.IsAny<BloodType>())).ReturnsAsync(GetBloodType());

            var bloodType= await this.bloodTypeService.Create(request);

            Assert.NotNull(bloodType);
            Assert.Equal(bloodType.Name, request.Name);
            Assert.Equal(bloodType.Image, request.Image);
            this.repositoryFixture.BloodTypeRepositoryMock.Verify(x => x.Create(It.Is<BloodType>(b => b.Name == request.Name && b.Image == request.Image)), Times.Once);
        }

        [Fact]
        public async Task Create_Invalid_ThrowsValidationException()
        {
            BloodTypeRequest bloodTypeRequest = new BloodTypeRequest { Name = string.Empty, Image = string.Empty };

            await Assert.ThrowsAsync<ValidationException>(() => this.bloodTypeService.Create(bloodTypeRequest));
        }

        [Fact]
        public async Task GetAll_Success_ReturnsBloodTypes()
        {
            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.GetAll()).ReturnsAsync(this.GetBloodTypes());
            
            var bloodTypes = await this.bloodTypeService.GetAll();

            Assert.NotEmpty(bloodTypes);
        }

        [Fact]
        public async Task GetAll_Success_ReturnsEmpty()
        {
            IEnumerable<BloodType> emptyList = new List<BloodType>();

            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.GetAll()).ReturnsAsync(emptyList);

            var bloodTypes = await this.bloodTypeService.GetAll();

            Assert.Empty(bloodTypes);
        }

        //Método bajo prueba + Escenario + Resultado esperado
        [Fact]
        public async Task GetById_Success()
        {
            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync(this.GetBloodType());
            
            var bloodTypes = await this.bloodTypeService.Get(Guid.NewGuid());

            Assert.NotNull(bloodTypes);
        }



        [Fact]
        public async Task Update_Success_BloodTypeUpdated()
        {
            var id = Guid.NewGuid();
            var existing = this.GetBloodType();
            existing.Id = id;

            var request = new BloodTypeRequest { Name = "NewName", Image = "img.png" };

            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync(existing);
            
            this.repositoryFixture.MapperMock
                .Setup(m => m.Map(It.IsAny<BloodTypeRequest>(), It.IsAny<BloodType>()))
                .Callback<BloodTypeRequest, BloodType>((src, dest) => { dest.Name = src.Name; dest.Image = src.Image; })
                .Returns((BloodTypeRequest src, BloodType dest) => dest);
            
            this.repositoryFixture.BloodTypeRepositoryMock.Setup(x => x.Update(It.IsAny<BloodType>())).ReturnsAsync((BloodType b) => b);

            var result = await this.bloodTypeService.Update(id, request);

            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.Image, result.Image);
            this.repositoryFixture.BloodTypeRepositoryMock.Verify(x => x.Update(It.Is<BloodType>(b => b.Id == id && b.Name == request.Name && b.Image == request.Image)), Times.Once);
        }

        [Fact]
        public async Task Update_NotFound_ThrowsEntityNotFoundException()
        {
            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync((BloodType?)null);

            await Assert.ThrowsAsync<EntityNotFoundException>(() => this.bloodTypeService.Update(Guid.NewGuid(), new BloodTypeRequest { Name = "X", Image = "Y" }));
        }

        [Fact]
        public async Task Update_Invalid_ThrowsValidationException()
        {
            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync(this.GetBloodType());

            await Assert.ThrowsAsync<ValidationException>(() => this.bloodTypeService.Update(Guid.NewGuid(), new BloodTypeRequest { Name = string.Empty, Image = string.Empty }));
        }

        [Fact]
        public async Task Update_ThrowsEntityNotFoundException()
        {
            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync((BloodType?)null);

            await Assert.ThrowsAsync<EntityNotFoundException>(() => this.bloodTypeService.Delete(Guid.NewGuid()));
        }

        [Fact]
        public async Task Delete_CallsRepositoryDelete()
        {
            var id = Guid.NewGuid();

            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Delete(It.IsAny<Guid>()));

            await this.bloodTypeService.Delete(id);

            this.repositoryFixture.BloodTypeRepositoryMock.Verify(x => x.Delete(id), Times.Once);
        }

        [Fact]
        public async Task Delete_ThrowsEntityNotFoundException()
        {
            this.repositoryFixture.BloodTypeRepositoryMock
                .Setup(x => x.Get(It.IsAny<Guid>())).ReturnsAsync((BloodType?)null);

            await Assert.ThrowsAsync<EntityNotFoundException>(() => this.bloodTypeService.Delete(Guid.NewGuid()));
        }
    }
}
