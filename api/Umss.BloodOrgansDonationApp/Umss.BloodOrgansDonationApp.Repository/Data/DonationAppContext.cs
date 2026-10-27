using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;

namespace Umss.BloodOrgansDonationApp.Repository.Data
{
    public class DonationAppContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public DonationAppContext(DbContextOptions<DonationAppContext> options) : base(options) { }
        public DbSet<BloodType> BloodTypes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<DonationType> DonationTypes { get; set; }
        public DbSet<DonationCenter> DonationCenters { get; set; }
        public DbSet<DonationPost> DonationPosts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<DonationCenterDonationType> DonationCentersDonationTypes { get; set; }
        public DbSet<DonationRequestStatusChange> DonationRequestStatusChanges { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // One local profile per Keycloak user. Postgres allows many NULLs in a unique index,
            // so profiles not linked yet don't collide.
            modelBuilder.Entity<User>(user =>
            {
                user.Property(u => u.KeycloakSubject).HasMaxLength(255);
                user.Property(u => u.City).HasMaxLength(100);
                user.HasIndex(u => u.KeycloakSubject).IsUnique();
            });

            modelBuilder.Entity<DonationCenterDonationType>()
                .HasKey(x => new { x.DonationCenterId, x.DonationTypeId });


            modelBuilder.Entity<DonationPost>()
                .HasOne(p => p.User)
                .WithMany(u => u.DonationPosts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict); // or DeleteBehavior.NoAction

            modelBuilder.Entity<DonationPost>()
                .HasOne(p => p.DonationCenter)
                .WithMany(dc => dc.DonationPosts)
                .HasForeignKey(p => p.DonationCenterId)
                .OnDelete(DeleteBehavior.Restrict); // or DeleteBehavior.NoAction
                                                    //.OnDelete(DeleteBehavior.Cascade);

            // Feed order (newest first, Id as tie-breaker); Postgres reads it backwards for DESC.
            modelBuilder.Entity<DonationPost>()
                .HasIndex(p => new { p.CreatedAt, p.Id });

            // Clinical request (US-API-01/02). Enums are stored as text so the data reads on its own
            // and reordering an enum can't change stored meaning.
            modelBuilder.Entity<DonationPost>(post =>
            {
                post.Property(p => p.Folio)
                    .UseIdentityByDefaultColumn()
                    .HasIdentityOptions(startValue: 1000)
                    .ValueGeneratedOnAdd();
                post.HasIndex(p => p.Folio).IsUnique();

                post.Property(p => p.Urgency).HasConversion<string>().HasMaxLength(20);
                post.Property(p => p.Component).HasConversion<string>().HasMaxLength(30);
                post.Property(p => p.Status).HasConversion<string>().HasMaxLength(30);

                post.Property(p => p.PatientCode).HasMaxLength(40);
                post.Property(p => p.Diagnosis).HasMaxLength(200);
                post.Property(p => p.Service).HasMaxLength(100);
                post.Property(p => p.Bed).HasMaxLength(50);
                post.Property(p => p.MedicalRecord).HasMaxLength(50);
                post.Property(p => p.CoordinationPhone).HasMaxLength(20);

                // Optimistic concurrency: a phase change or a unit count saved by someone else in the
                // meantime makes SaveChanges fail instead of silently overwriting it (409).
                post.Property(p => p.Status).IsConcurrencyToken();
                post.Property(p => p.UnitsCovered).IsConcurrencyToken();

                // The board: one phase, most urgent first.
                post.HasIndex(p => new { p.Status, p.Urgency, p.Deadline });

                post.HasOne(p => p.StatusChangedBy)
                    .WithMany()
                    .HasForeignKey(p => p.StatusChangedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DonationRequestStatusChange>(change =>
            {
                change.Property(c => c.FromStatus).HasConversion<string>().HasMaxLength(30);
                change.Property(c => c.ToStatus).HasConversion<string>().HasMaxLength(30);
                change.Property(c => c.ChangedBySubject).HasMaxLength(255);
                change.Property(c => c.Reason).HasMaxLength(300);

                change.HasOne(c => c.DonationPost)
                    .WithMany(p => p.StatusChanges)
                    .HasForeignKey(c => c.DonationPostId)
                    .OnDelete(DeleteBehavior.Cascade);

                change.HasOne(c => c.ChangedBy)
                    .WithMany()
                    .HasForeignKey(c => c.ChangedById)
                    .OnDelete(DeleteBehavior.Restrict);

                change.HasIndex(c => new { c.DonationPostId, c.ChangedAt });
            });

            modelBuilder.Entity<Comment>()
                .HasOne(p => p.DonationPost)
                .WithMany(c => c.Comments)
                .HasForeignKey(p => p.DonationPostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(p => p.User)
                .WithMany(c => c.Comments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DonationCenterDonationType>()
                .HasKey(dt => new { dt.DonationCenterId, dt.DonationTypeId });

            modelBuilder.Entity<DonationCenterDonationType>()
                .HasOne(dt => dt.DonationCenter)
                .WithMany(dc => dc.DonationCenterDonationTypes)
                .HasForeignKey(dt => dt.DonationCenterId);

            modelBuilder.Entity<DonationCenterDonationType>()
                .HasOne(dt => dt.DonationType)
                .WithMany(t => t.DonationCenterDonationTypes)
                .HasForeignKey(dt => dt.DonationTypeId);
        }
    }
}
