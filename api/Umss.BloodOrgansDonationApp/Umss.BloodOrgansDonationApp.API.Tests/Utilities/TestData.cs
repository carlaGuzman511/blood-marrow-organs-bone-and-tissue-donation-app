using Microsoft.AspNetCore.Mvc.Testing;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.API.Tests.Utilities
{
    /// <summary>
    /// Creates the rows a test needs, with unique values, so tests don't depend on DataSeeder
    /// (which currently fails on an empty database) or on each other.
    /// </summary>
    public static class TestData
    {
        public static Task<BloodType> AddBloodTypeAsync(this WebApplicationFactory<Program> factory) =>
            factory.QueryDbAsync(async db =>
            {
                BloodType bloodType = new BloodType { Id = Guid.NewGuid(), Name = "O+", Image = "o.png" };
                db.BloodTypes.Add(bloodType);
                await db.SaveChangesAsync();
                return bloodType;
            });

        /// <summary>A legacy profile (as created by /register or the seed): no Keycloak link yet.</summary>
        public static async Task<User> AddUserAsync(this WebApplicationFactory<Program> factory, string? email = null, string? keycloakSubject = null)
        {
            BloodType bloodType = await factory.AddBloodTypeAsync();

            return await factory.QueryDbAsync(async db =>
            {
                User user = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = "Test User",
                    Email = email ?? $"user-{Guid.NewGuid():N}@example.com",
                    BloodTypeId = bloodType.Id,
                    Address = "Calle 1",
                    City = "Cochabamba",
                    Latitude = -16.5,
                    Longitude = -68.1,
                    DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    PhoneNumber = "+59170000000",
                    Image = "user.png",
                    KeycloakSubject = keycloakSubject,
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();
                return user;
            });
        }

        public static Task<DonationType> AddDonationTypeAsync(this WebApplicationFactory<Program> factory) =>
            factory.QueryDbAsync(async db =>
            {
                DonationType donationType = new DonationType
                {
                    Id = Guid.NewGuid(),
                    Name = "Sangre",
                    Description = "d",
                    Requirements = "r",
                    Process = "p",
                    Importance = "i",
                    Benefits = "b",
                    SecondaryEffects = "s",
                    Image = "sangre.png",
                };
                db.DonationTypes.Add(donationType);
                await db.SaveChangesAsync();
                return donationType;
            });

        public static async Task<DonationPost> AddPostAsync(this WebApplicationFactory<Program> factory, Guid userId)
        {
            BloodType bloodType = await factory.AddBloodTypeAsync();
            DonationType donationType = await factory.AddDonationTypeAsync();

            return await factory.QueryDbAsync(async db =>
            {
                DonationPost post = new DonationPost
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BloodTypeId = bloodType.Id,
                    DonationTypeId = donationType.Id,
                    Title = "Se necesita sangre",
                    Description = "Urgente",
                    Image = "post.png",
                    CreatedAt = DateTime.UtcNow,
                };
                db.DonationPosts.Add(post);
                await db.SaveChangesAsync();
                return post;
            });
        }

        public static Task<Comment> AddCommentAsync(this WebApplicationFactory<Program> factory, Guid postId, Guid authorId) =>
            factory.QueryDbAsync(async db =>
            {
                Comment comment = new Comment
                {
                    Id = Guid.NewGuid(),
                    DonationPostId = postId,
                    UserId = authorId,
                    Description = "Puedo donar",
                    CreatedAt = DateTime.UtcNow,
                };
                db.Comments.Add(comment);
                await db.SaveChangesAsync();
                return comment;
            });
    }
}
