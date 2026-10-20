using Microsoft.EntityFrameworkCore;
using Npgsql;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Extensions;
using Microsoft.AspNetCore.Identity;
using Umss.BloodOrgansDonationApp.Repository.Data;

namespace Umss.BloodOrgansDonationApp.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly DonationAppContext _appContext;
        private readonly UserManager<User> _userManager;
        public UserRepository(DonationAppContext appContext, UserManager<User> userManager)
        {
            _appContext = appContext;
            _userManager = userManager;

        }

        public async Task<bool> CheckPasswordAsync(User user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<User> Create(User element)
        {
            await _appContext.AddAsync(element);
            await _appContext.SaveChangesAsync();
            return element;
        }

        //TODO: Implement a soft delete due foreign key issues.
        public async Task Delete(Guid id)
        {
            User? user = await Get(id);
            if (user != null)
            {
                _appContext.Remove(user);
                await _appContext.SaveChangesAsync();
            }
        }

        public async Task<User?> Get(Guid id)
        {
            return await _appContext.Users.FindAsync(id);
        }

        public async Task<PagedResult<User>> GetAll(UserQuery query)
        {
            IQueryable<User> users = FilterByBloodTypeAndCity(_appContext.Users.AsNoTracking(), query.BloodTypeId, query.City);

            string? search = query.NormalizedSearch();
            if (search != null)
            {
                users = users.Where(u => u.FullName.ToLower().Contains(search) || (u.Email != null && u.Email.ToLower().Contains(search)));
            }

            return await users
                .Include(u => u.BloodType)
                .OrderBy(u => u.FullName)
                .ThenBy(u => u.Id)
                .ToPagedResultAsync(query);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var normalizedEmail = _userManager.NormalizeEmail(email);

            return await _userManager.FindByEmailAsync(normalizedEmail);
        }

        public async Task<User> Update(User element)
        {
            await _appContext.SaveChangesAsync();
            return element;
        }

        public async Task<IEnumerable<string>> GetRolesAsync(User user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<PagedResult<User>> GetDirectoryAsync(DonorQuery query)
        {
            IQueryable<User> users = FilterByBloodTypeAndCity(_appContext.Users.AsNoTracking(), query.BloodTypeId, query.City);

            // Name only: the directory must not be searchable by email or other private fields.
            string? search = query.NormalizedSearch();
            if (search != null)
            {
                users = users.Where(u => u.FullName.ToLower().Contains(search));
            }

            return await users
                .Include(u => u.BloodType)
                .OrderBy(u => u.FullName)
                .ThenBy(u => u.Id)
                .ToPagedResultAsync(query);
        }

        private static IQueryable<User> FilterByBloodTypeAndCity(IQueryable<User> users, Guid? bloodTypeId, string? city)
        {
            if (bloodTypeId.HasValue)
            {
                Guid id = bloodTypeId.Value;
                users = users.Where(u => u.BloodTypeId == id);
            }

            if (!string.IsNullOrWhiteSpace(city))
            {
                string normalizedCity = city.Trim().ToLowerInvariant();
                users = users.Where(u => u.City != null && u.City.ToLower() == normalizedCity);
            }

            return users;
        }

        public async Task<User?> GetDirectoryEntryAsync(Guid id)
        {
            return await _appContext.Users
                .Include(u => u.BloodType)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        // Tracked on purpose: ProfileService updates the entity it gets back.
        public async Task<User?> GetByKeycloakSubjectAsync(string keycloakSubject)
        {
            return await _appContext.Users
                .Include(u => u.BloodType)
                .FirstOrDefaultAsync(u => u.KeycloakSubject == keycloakSubject);
        }

        public async Task<IReadOnlyList<User>> GetUnlinkedByEmailAsync(string email)
        {
            // Compare on Email, not NormalizedEmail: legacy rows (seed, /register) never set NormalizedEmail.
            string upper = email.Trim().ToUpperInvariant();

            return await _appContext.Users
                .AsNoTracking()
                .Where(u => u.KeycloakSubject == null && u.Email != null && u.Email.ToUpper() == upper)
                .Take(2)
                .ToListAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            string upper = email.Trim().ToUpperInvariant();

            return await _appContext.Users.AnyAsync(u => u.Email != null && u.Email.ToUpper() == upper);
        }

        public async Task<bool> TryLinkKeycloakSubjectAsync(Guid userId, string keycloakSubject)
        {
            try
            {
                if (_appContext.Database.IsRelational())
                {
                    // Single conditional UPDATE: of two concurrent first requests only one links the row.
                    int updated = await _appContext.Users
                        .Where(u => u.Id == userId && u.KeycloakSubject == null)
                        .ExecuteUpdateAsync(s => s.SetProperty(u => u.KeycloakSubject, keycloakSubject));

                    return updated == 1;
                }

                // EF InMemory (tests) has no ExecuteUpdate.
                User? user = await _appContext.Users.FindAsync(userId);
                if (user == null || user.KeycloakSubject != null)
                {
                    return false;
                }

                user.KeycloakSubject = keycloakSubject;
                await _appContext.SaveChangesAsync();
                return true;
            }
            catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                // Unique index: this Keycloak user is already linked to another profile.
                return false;
            }
        }
    }
}
