using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Tests.Utilities;

namespace Umss.BloodOrgansDonationApp.Repository.Tests
{
    /// <summary>
    /// Regression tests for US-API-31: Update() used to call SaveChangesAsync() on entities read
    /// with AsNoTracking(), so PUT returned 200 but nothing was written. Each test follows the
    /// real service flow (untracked Get, mutate, Update) and verifies through a new context.
    /// </summary>
    public class UpdatePersistenceTest
    {
        [Fact(DisplayName = "DonationPost Update persists changes read with AsNoTracking")]
        public async Task DonationPostUpdate_PersistsChanges()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();

            await using (DonationAppContext context = db.NewContext())
            {
                var repository = new DonationPostRepository(context);
                DonationPost post = (await repository.GetByUser(db.User.Id, db.DonationPost.Id))!;
                post.Title = "Titulo editado";
                post.Description = "Descripcion editada";
                await repository.Update(post);
            }

            await using DonationAppContext verify = db.NewContext();
            DonationPost saved = (await new DonationPostRepository(verify).GetByUser(db.User.Id, db.DonationPost.Id))!;
            Assert.Equal("Titulo editado", saved.Title);
            Assert.Equal("Descripcion editada", saved.Description);
            Assert.Equal(db.DonationPost.CreatedAt, saved.CreatedAt);
        }

        [Fact(DisplayName = "DonationPost Update returns the post with refreshed navigations")]
        public async Task DonationPostUpdate_ReturnsRefreshedNavigations()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();

            await using DonationAppContext context = db.NewContext();
            var repository = new DonationPostRepository(context);
            DonationPost post = (await repository.GetByUser(db.User.Id, db.DonationPost.Id))!;
            post.BloodTypeId = db.BloodTypeB.Id;

            DonationPost updated = await repository.Update(post);

            Assert.Equal(db.BloodTypeB.Id, updated.BloodTypeId);
            Assert.Equal("O-", updated.BloodType.Name);
            Assert.Single(updated.Comments);
        }

        [Fact(DisplayName = "DonationCenter Update persists changes read with AsNoTracking")]
        public async Task DonationCenterUpdate_PersistsChanges()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();

            await using (DonationAppContext context = db.NewContext())
            {
                var repository = new DonationCenterRepository(context);
                DonationCenter center = (await repository.Get(db.DonationCenter.Id))!;
                center.Name = "Centro Editado";
                center.Phone = "7777777";
                DonationCenter updated = await repository.Update(center);
                Assert.Single(updated.DonationCenterDonationTypes);
            }

            await using DonationAppContext verify = db.NewContext();
            DonationCenter saved = (await new DonationCenterRepository(verify).Get(db.DonationCenter.Id))!;
            Assert.Equal("Centro Editado", saved.Name);
            Assert.Equal("7777777", saved.Phone);
        }

        [Fact(DisplayName = "Comment Update persists changes read with AsNoTracking")]
        public async Task CommentUpdate_PersistsChanges()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();

            await using (DonationAppContext context = db.NewContext())
            {
                var repository = new CommentRepository(context);
                Comment comment = (await repository.Get(db.DonationPost.Id, db.Comment.Id))!;
                comment.Description = "Comentario editado";
                await repository.Update(comment);
            }

            await using DonationAppContext verify = db.NewContext();
            Comment saved = (await new CommentRepository(verify).Get(db.DonationPost.Id, db.Comment.Id))!;
            Assert.Equal("Comentario editado", saved.Description);
        }

        [Fact(DisplayName = "Update throws EntityNotFoundException when the entity was deleted meanwhile")]
        public async Task Update_DeletedEntity_ThrowsEntityNotFound()
        {
            InMemoryDatabase db = await new InMemoryDatabase().SeedAsync();

            await using DonationAppContext context = db.NewContext();
            var repository = new CommentRepository(context);
            Comment comment = (await repository.Get(db.DonationPost.Id, db.Comment.Id))!;
            await repository.Delete(db.DonationPost.Id, db.Comment.Id);

            await Assert.ThrowsAsync<EntityNotFoundException>(() => repository.Update(comment));
        }
    }
}
