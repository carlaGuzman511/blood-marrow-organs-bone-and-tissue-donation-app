using Moq;
using FluentValidation;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Service.Tests.Utilities;
using Umss.BloodOrgansDonationApp.Services;

namespace Umss.BloodOrgansDonationApp.Service.Tests.Services
{
    public class DonationCenterServiceTest : IClassFixture<RepositoryFixture>
    {
        private readonly RepositoryFixture repositoryFixture;
        private readonly DonationCenterService donationCenterService;

        public DonationCenterServiceTest(RepositoryFixture repositoryFixture)
        {
            this.repositoryFixture = repositoryFixture;
            this.donationCenterService = new DonationCenterService(
                repositoryFixture.DonationCenterRepository,
                repositoryFixture.DonationTypeRepository,
                repositoryFixture.Mapper);
        }

        #region Test Data Builders

        private IEnumerable<DonationCenter> GetDonationCenters()
        {
            return new DonationCenter[3]
            {
                new DonationCenter
                {
                    Id = Guid.NewGuid(),
                    Name = "Viedma Hospital",
                    Address = "Av Blanco Galindo Km 6",
                    City = "Cochabamba - Bolivia",
                    Latitude = 17.525,
                    Longitude = 12.2555,
                    Image = "viedma.jpg"
                },
                new DonationCenter
                {
                    Id = Guid.NewGuid(),
                    Name = "Belga Hospital",
                    Address = "Av Blanco Galindo Km 6",
                    City = "Cochabamba - Bolivia",
                    Latitude = 17.525,
                    Longitude = 12.2555,
                    Image = "belga.jpg"
                },
                new DonationCenter
                {
                    Id = Guid.NewGuid(),
                    Name = "Univalle Hospital",
                    Address = "Av Blanco Galindo Km 6",
                    City = "Cochabamba - Bolivia",
                    Latitude = 17.525,
                    Longitude = 12.2555,
                    Image = "univalle.jpg"
                }
            };
        }

        private IEnumerable<DonationCenter> GetEmptyDonationCenters()
        {
            return Enumerable.Empty<DonationCenter>();
        }

        private DonationCenter GetDonationCenter()
        {
            return new DonationCenter
            {
                Id = Guid.NewGuid(),
                Name = "Viedma Hospital",
                Address = "Av Blanco Galindo Km 6",
                City = "Cochabamba - Bolivia",
                Latitude = 17.525,
                Longitude = 12.2555,
                Image = "viedma.jpg"
            };
        }

        private IEnumerable<DonationType> GetDonationTypes()
        {
            return new DonationType[2]
            {
                new DonationType
                {
                    Id = Guid.NewGuid(),
                    Name = "Blood Donation",
                    Description = "Blood",
                    Requirements = "Age 18+",
                    Process = "Sterile",
                    Importance = "Critical",
                    Benefits = "Life-saving",
                    SecondaryEffects = "Fatigue",
                    Image = "blood.jpg"
                },
                new DonationType
                {
                    Id = Guid.NewGuid(),
                    Name = "Plasma Donation",
                    Description = "Plasma",
                    Requirements = "Age 18+",
                    Process = "Apheresis",
                    Importance = "Important",
                    Benefits = "Compensation",
                    SecondaryEffects = "Dehydration",
                    Image = "plasma.jpg"
                }
            };
        }

        private DonationCenterRequest GetValidDonationCenterRequest()
        {
            var donationTypeIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            return new DonationCenterRequest
            {
                Name = "Viedma Hospital",
                Address = "Av. Blanco Galindo Km 6",
                City = "Cochabamba - Bolivia",
                Latitude = 17.525,
                Longitude = 12.2555,
                DonationTypeIds = donationTypeIds,
                Image = "viedma.jpg"
            };
        }

        private DonationCenterRequest GetInvalidDonationCenterRequestWithEmptyName()
        {
            return new DonationCenterRequest
            {
                Name = string.Empty,
                Address = "Av. Blanco Galindo Km 6",
                City = "Cochabamba - Bolivia",
                Latitude = 17.525,
                Longitude = 12.2555,
                DonationTypeIds = new List<Guid> { Guid.NewGuid() },
                Image = "viedma.jpg"
            };
        }

        private DonationCenterRequest GetInvalidDonationCenterRequestWithEmptyAddress()
        {
            return new DonationCenterRequest
            {
                Name = "Viedma Hospital",
                Address = string.Empty,
                City = "Cochabamba - Bolivia",
                Latitude = 17.525,
                Longitude = 12.2555,
                DonationTypeIds = new List<Guid> { Guid.NewGuid() },
                Image = "viedma.jpg"
            };
        }

        private DonationCenterRequest GetInvalidDonationCenterRequestWithEmptyDonationTypes()
        {
            return new DonationCenterRequest
            {
                Name = "Viedma Hospital",
                Address = "Av. Blanco Galindo Km 6",
                City = "Cochabamba - Bolivia",
                Latitude = 17.525,
                Longitude = 12.2555,
                DonationTypeIds = new List<Guid>(),
                Image = "viedma.jpg"
            };
        }

        private DonationCenterRequest GetInvalidDonationCenterRequestWithInvalidCoordinates()
        {
            return new DonationCenterRequest
            {
                Name = "Viedma Hospital",
                Address = "Av. Blanco Galindo Km 6",
                City = "Cochabamba - Bolivia",
                Latitude = 0,
                Longitude = 0,
                DonationTypeIds = new List<Guid> { Guid.NewGuid() },
                Image = "viedma.jpg"
            };
        }

        private DonationCenterRequest GetInvalidDonationCenterRequestWithEmptyImage()
        {
            return new DonationCenterRequest
            {
                Name = "Viedma Hospital",
                Address = "Av. Blanco Galindo Km 6",
                City = "Cochabamba - Bolivia",
                Latitude = 17.525,
                Longitude = 12.2555,
                DonationTypeIds = new List<Guid> { Guid.NewGuid() },
                Image = string.Empty
            };
        }

        #endregion

        #region Positive Test Cases

        [Fact(DisplayName = "GetAll should return multiple donation centers successfully")]
        public async Task GetAll_WithMultipleRecords_ReturnsNotEmptyList()
        {
            // Arrange
            var donationCenters = this.GetDonationCenters();
            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.GetAll())
                .ReturnsAsync(donationCenters);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenterResponse>(It.IsAny<DonationCenter>()))
                .Returns((DonationCenter src) => new DonationCenterResponse 
                { 
                    Id = src.Id, 
                    Name = src.Name,
                    Address = src.Address,
                    City = src.City,
                    Latitude = src.Latitude,
                    Longitude = src.Longitude,
                    Image = src.Image
                });

            // Act
            var result = await this.donationCenterService.GetAll();

            // Assert
            Assert.NotEmpty(result);
            Assert.Equal(3, result.Count());
        }

        [Fact(DisplayName = "GetAll should return empty list when no records exist")]
        public async Task GetAll_WithNoRecords_ReturnsEmptyList()
        {
            // Arrange
            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.GetAll())
                .ReturnsAsync(this.GetEmptyDonationCenters());

            // Act
            var result = await this.donationCenterService.GetAll();

            // Assert
            Assert.Empty(result);
            this.repositoryFixture.DonationCenterRepositoryMock.Verify(x => x.GetAll(), Times.Once);
        }

        [Fact(DisplayName = "Get should return donation center when valid ID is provided")]
        public async Task Get_WithValidId_ReturnsNotNull()
        {
            // Arrange
            var donationCenter = this.GetDonationCenter();
            var id = Guid.NewGuid();

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Get(id))
                .ReturnsAsync(donationCenter);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenterResponse>(It.IsAny<DonationCenter>()))
                .Returns(new DonationCenterResponse 
                { 
                    Id = donationCenter.Id, 
                    Name = donationCenter.Name,
                    Address = donationCenter.Address,
                    City = donationCenter.City,
                    Latitude = donationCenter.Latitude,
                    Longitude = donationCenter.Longitude,
                    Image = donationCenter.Image
                });

            // Act
            var result = await this.donationCenterService.Get(id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(donationCenter.Id, result.Id);
        }

        [Fact(DisplayName = "Get should return null when donation center doesn't exist")]
        public async Task Get_WithNonExistentId_ReturnsNull()
        {
            // Arrange
            var id = Guid.NewGuid();
            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Get(id))
                .ReturnsAsync((DonationCenter)null);

            // Act
            var result = await this.donationCenterService.Get(id);

            // Assert
            Assert.Null(result);
        }

        [Fact(DisplayName = "Create should create donation center with valid request")]
        public async Task Create_WithValidRequest_CreatesSuccessfully()
        {
            // Arrange
            var request = this.GetValidDonationCenterRequest();
            var donationTypes = this.GetDonationTypes();
            var createdDonationCenter = this.GetDonationCenter();

            this.repositoryFixture.DonationTypeRepositoryMock
                .Setup(x => x.GetByIds(request.DonationTypeIds))
                .ReturnsAsync(donationTypes);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenter>(request))
                .Returns(new DonationCenter
                {
                    Name = request.Name,
                    Address = request.Address,
                    City = request.City,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    Image = request.Image
                });

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Create(It.IsAny<DonationCenter>()))
                .ReturnsAsync(createdDonationCenter);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenterResponse>(It.IsAny<DonationCenter>()))
                .Returns(new DonationCenterResponse 
                { 
                    Id = createdDonationCenter.Id, 
                    Name = createdDonationCenter.Name,
                    Address = createdDonationCenter.Address,
                    City = createdDonationCenter.City,
                    Latitude = createdDonationCenter.Latitude,
                    Longitude = createdDonationCenter.Longitude,
                    Image = createdDonationCenter.Image
                });

            // Act
            var result = await this.donationCenterService.Create(request);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
        }

        [Fact(DisplayName = "Create should link donation types to donation center")]
        public async Task Create_WithValidRequest_LinksDonationTypesSuccessfully()
        {
            // Arrange
            var request = this.GetValidDonationCenterRequest();
            var donationTypes = this.GetDonationTypes();
            var createdDonationCenter = new DonationCenter
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Address = request.Address,
                City = request.City,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Image = request.Image,
                DonationCenterDonationTypes = new List<DonationCenterDonationType>()
            };

            this.repositoryFixture.DonationTypeRepositoryMock
                .Setup(x => x.GetByIds(request.DonationTypeIds))
                .ReturnsAsync(donationTypes);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenter>(request))
                .Returns(new DonationCenter
                {
                    Name = request.Name,
                    Address = request.Address,
                    City = request.City,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    Image = request.Image,
                    DonationCenterDonationTypes = new List<DonationCenterDonationType>()
                });

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Create(It.IsAny<DonationCenter>()))
                .ReturnsAsync(createdDonationCenter);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenterResponse>(It.IsAny<DonationCenter>()))
                .Returns(new DonationCenterResponse 
                { 
                    Id = createdDonationCenter.Id, 
                    Name = createdDonationCenter.Name,
                    Address = createdDonationCenter.Address,
                    City = createdDonationCenter.City,
                    Latitude = createdDonationCenter.Latitude,
                    Longitude = createdDonationCenter.Longitude,
                    Image = createdDonationCenter.Image
                });

            // Act
            var result = await this.donationCenterService.Create(request);

            // Assert
            Assert.NotNull(result);
        }

        [Fact(DisplayName = "Update should update donation center with valid request")]
        public async Task Update_WithValidRequest_UpdatesSuccessfully()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = this.GetValidDonationCenterRequest();
            var existingDonationCenter = this.GetDonationCenter();
            var updatedDonationCenter = this.GetDonationCenter();

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Get(id))
                .ReturnsAsync(existingDonationCenter);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map(request, existingDonationCenter))
                .Returns(updatedDonationCenter);

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Update(It.IsAny<DonationCenter>()))
                .ReturnsAsync(updatedDonationCenter);

            this.repositoryFixture.MapperMock
                .Setup(x => x.Map<DonationCenterResponse>(It.IsAny<DonationCenter>()))
                .Returns(new DonationCenterResponse 
                { 
                    Id = updatedDonationCenter.Id, 
                    Name = updatedDonationCenter.Name,
                    Address = updatedDonationCenter.Address,
                    City = updatedDonationCenter.City,
                    Latitude = updatedDonationCenter.Latitude,
                    Longitude = updatedDonationCenter.Longitude,
                    Image = updatedDonationCenter.Image
                });

            // Act
            var result = await this.donationCenterService.Update(id, request);

            // Assert
            Assert.NotNull(result);
        }

        [Fact(DisplayName = "Delete should delete donation center successfully")]
        public async Task Delete_WithValidId_DeletesSuccessfully()
        {
            // Arrange
            var id = Guid.NewGuid();
            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Delete(id))
                .Returns(Task.CompletedTask);

            // Act
            await this.donationCenterService.Delete(id);

            // Assert (no exception thrown means success)
        }

        #endregion

        #region Negative Test Cases

        [Fact(DisplayName = "Create should throw ValidationException when Name is empty")]
        public async Task Create_WithEmptyName_ThrowsValidationException()
        {
            // Arrange
            var request = this.GetInvalidDonationCenterRequestWithEmptyName();

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Create(request));
        }

        [Fact(DisplayName = "Create should throw ValidationException when Address is empty")]
        public async Task Create_WithEmptyAddress_ThrowsValidationException()
        {
            // Arrange
            var request = this.GetInvalidDonationCenterRequestWithEmptyAddress();

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Create(request));
        }

        [Fact(DisplayName = "Create should throw ValidationException when DonationTypeIds is empty")]
        public async Task Create_WithEmptyDonationTypeIds_ThrowsValidationException()
        {
            // Arrange
            var request = this.GetInvalidDonationCenterRequestWithEmptyDonationTypes();

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Create(request));
        }

        [Fact(DisplayName = "Create should throw ValidationException when Image is empty")]
        public async Task Create_WithEmptyImage_ThrowsValidationException()
        {
            // Arrange
            var request = this.GetInvalidDonationCenterRequestWithEmptyImage();

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Create(request));
        }

        [Fact(DisplayName = "Create should throw ValidationException when coordinates are zero")]
        public async Task Create_WithInvalidCoordinates_ThrowsValidationException()
        {
            // Arrange
            var request = this.GetInvalidDonationCenterRequestWithInvalidCoordinates();

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Create(request));
        }

        [Fact(DisplayName = "Update should throw EntityNotFoundException when donation center doesn't exist")]
        public async Task Update_WithNonExistentId_ThrowsEntityNotFoundException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = this.GetValidDonationCenterRequest();

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Get(id))
                .ReturnsAsync((DonationCenter)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<EntityNotFoundException>(
                async () => await this.donationCenterService.Update(id, request));

            Assert.Contains(id.ToString(), exception.Message);
        }

        [Fact(DisplayName = "Update should throw ValidationException when request has empty Name")]
        public async Task Update_WithInvalidRequest_ThrowsValidationException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = this.GetInvalidDonationCenterRequestWithEmptyName();
            var existingDonationCenter = this.GetDonationCenter();

            this.repositoryFixture.DonationCenterRepositoryMock
                .Setup(x => x.Get(id))
                .ReturnsAsync(existingDonationCenter);

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Update(id, request));
        }

        [Fact(DisplayName = "Create should throw ValidationException when coordinates are empty/zero")]
        public async Task Create_WithZeroLatitude_ThrowsValidationException()
        {
            // Arrange
            var request = new DonationCenterRequest
            {
                Name = "Test Center",
                Address = "Test Address",
                City = "Test City",
                Latitude = 0,
                Longitude = 12.2555,
                DonationTypeIds = new List<Guid> { Guid.NewGuid() },
                Image = "test.jpg"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(
                async () => await this.donationCenterService.Create(request));
        }

        #endregion
    }
}
