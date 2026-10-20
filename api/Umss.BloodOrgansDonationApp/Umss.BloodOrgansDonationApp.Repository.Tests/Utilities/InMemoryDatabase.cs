using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.Repository.Tests.Utilities
{
    /// <summary>
    /// One isolated InMemory database per test. <see cref="NewContext"/> returns a fresh
    /// DbContext over the same store, like separate HTTP request scopes: asserting through
    /// a new context proves a change was persisted, not just mutated in memory.
    /// </summary>
    public class InMemoryDatabase
    {
        private readonly DbContextOptions<DonationAppContext> _options;

        public InMemoryDatabase()
        {
            _options = new DbContextOptionsBuilder<DonationAppContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
        }

        public DonationAppContext NewContext() => new DonationAppContext(_options);

        public BloodType BloodTypeA { get; } = new BloodType { Id = Guid.NewGuid(), Name = "A+", Image = "a.png" };
        public BloodType BloodTypeB { get; } = new BloodType { Id = Guid.NewGuid(), Name = "O-", Image = "o.png" };
        public DonationType DonationType { get; } = NewDonationType("Sangre");
        public User User { get; private set; } = null!;
        public User OtherUser { get; private set; } = null!;
        public DonationCenter DonationCenter { get; private set; } = null!;
        public DonationPost DonationPost { get; private set; } = null!;
        public Comment Comment { get; private set; } = null!;

        public async Task<InMemoryDatabase> SeedAsync()
        {
            User = NewUser("Ana", BloodTypeA.Id);
            OtherUser = NewUser("Luis", BloodTypeA.Id);
            DonationCenter = new DonationCenter
            {
                Id = Guid.NewGuid(),
                Name = "Centro Original",
                Address = "Calle 1",
                City = "Cochabamba",
                Email = "centro@test.com",
                OpeningHours = "08:00-18:00",
                Phone = "4444444",
                Image = "centro.png",
                Latitude = -17.39,
                Longitude = -66.15,
                DonationCenterDonationTypes = new List<DonationCenterDonationType>
                {
                    new DonationCenterDonationType { DonationTypeId = DonationType.Id }
                }
            };
            DonationPost = new DonationPost
            {
                Id = Guid.NewGuid(),
                Title = "Titulo original",
                Description = "Descripcion original",
                Image = "post.png",
                BloodTypeId = BloodTypeA.Id,
                DonationTypeId = DonationType.Id,
                UserId = User.Id,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };
            Comment = new Comment
            {
                Id = Guid.NewGuid(),
                Description = "Comentario original",
                DonationPostId = DonationPost.Id,
                UserId = User.Id,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            await using DonationAppContext context = NewContext();
            context.AddRange(BloodTypeA, BloodTypeB, DonationType, User, OtherUser, DonationCenter, DonationPost, Comment);
            await context.SaveChangesAsync();
            return this;
        }

        private static User NewUser(string name, Guid bloodTypeId) => new User
        {
            Id = Guid.NewGuid(),
            UserName = name,
            Email = $"{name.ToLowerInvariant()}@example.com",
            FullName = name,
            BloodTypeId = bloodTypeId,
            Address = "Calle 2",
            Latitude = 0,
            Longitude = 0,
            Image = "user.png"
        };

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
            Image = "dt.png"
        };
    }
}
