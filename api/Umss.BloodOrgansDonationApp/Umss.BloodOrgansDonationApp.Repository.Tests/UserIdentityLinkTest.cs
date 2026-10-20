using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Tests.Utilities;

namespace Umss.BloodOrgansDonationApp.Repository.Tests
{
    /// <summary>US-API-12: the queries that link a Keycloak user to its local profile.</summary>
    public class UserIdentityLinkTest
    {
        // These methods only use the DbContext; UserManager is for the legacy password login.
        private static UserRepository Repository(DonationAppContext context) => new UserRepository(context, null!);

        [Fact(DisplayName = "Email lookup ignores case and skips profiles that are already linked")]
        public async Task GetUnlinkedByEmail()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();
            await using (DonationAppContext context = db.NewContext())
            {
                (await context.Users.SingleAsync(u => u.Id == db.OtherUser.Id)).KeycloakSubject = "already-linked";
                await context.SaveChangesAsync();
            }

            await using DonationAppContext read = db.NewContext();
            UserRepository repository = Repository(read);

            Assert.Equal(db.User.Id, Assert.Single(await repository.GetUnlinkedByEmailAsync("  ANA@Example.com ")).Id);
            Assert.Empty(await repository.GetUnlinkedByEmailAsync("luis@example.com"));
            Assert.True(await repository.EmailExistsAsync("LUIS@example.com"));
            Assert.False(await repository.EmailExistsAsync("nobody@example.com"));
        }

        [Fact(DisplayName = "TryLink links an unlinked profile and persists it")]
        public async Task TryLink_Links()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();

            await using (DonationAppContext context = db.NewContext())
            {
                Assert.True(await Repository(context).TryLinkKeycloakSubjectAsync(db.User.Id, "kc-ana"));
            }

            await using DonationAppContext verify = db.NewContext();
            User? linked = await Repository(verify).GetByKeycloakSubjectAsync("kc-ana");
            Assert.Equal(db.User.Id, linked?.Id);
            Assert.NotNull(linked!.BloodType);
        }

        [Fact(DisplayName = "TryLink never overwrites an existing link")]
        public async Task TryLink_DoesNotRelink()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();
            await using (DonationAppContext context = db.NewContext())
            {
                await Repository(context).TryLinkKeycloakSubjectAsync(db.User.Id, "kc-first");
            }

            await using (DonationAppContext context = db.NewContext())
            {
                Assert.False(await Repository(context).TryLinkKeycloakSubjectAsync(db.User.Id, "kc-second"));
            }

            await using DonationAppContext verify = db.NewContext();
            Assert.Equal("kc-first", (await verify.Users.SingleAsync(u => u.Id == db.User.Id)).KeycloakSubject);
        }
    }
}
