using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;

namespace Umss.BloodOrgansDonationApp.Repository
{
    public class DonationCenterRepository : IDonationCenterRepository
    {
        private readonly DonationAppContext _appContext;

        public DonationCenterRepository(DonationAppContext appContext)
        {
            _appContext = appContext;
        }
        public async Task<DonationCenter> Create(DonationCenter element)
        {
            await _appContext.AddAsync(element);
            await _appContext.SaveChangesAsync();
            return element;
        }

        public async Task Delete(Guid id)
        {
            DonationCenter? donationCenter = await Get(id);
            if (donationCenter != null)
            {
                _appContext.Remove(donationCenter);
            }
            await _appContext.SaveChangesAsync();
        }

        public async Task<DonationCenter?> Get(Guid id)
        {
            return await _appContext.DonationCenters
                .Include(dc => dc.DonationCenterDonationTypes)
                    .ThenInclude(dcdt => dcdt.DonationType)
                    .AsNoTracking()
                .Include(dc => dc.DonationPosts)
                .FirstOrDefaultAsync(dc => dc.Id == id);
        }

        public async Task<IEnumerable<DonationCenter>> GetAll()
        {
            return await _appContext.DonationCenters
                .Include(dc => dc.DonationCenterDonationTypes)
                    .ThenInclude(dcdt => dcdt.DonationType)
                    .AsNoTracking()
                //.Include(dc => dc.DonationPosts)
                .ToListAsync();
        }

        /// <summary>
        /// Persists the scalar values of <paramref name="element"/>. Get returns an untracked
        /// entity, so the change is copied onto a tracked instance before saving.
        /// Donation types are not synced here (see US-API-32).
        /// </summary>
        public async Task<DonationCenter> Update(DonationCenter element)
        {
            DonationCenter tracked = await _appContext.DonationCenters.FindAsync(element.Id)
                ?? throw new EntityNotFoundException($"Donation Center with ID {element.Id} not found.");

            _appContext.Entry(tracked).CurrentValues.SetValues(element);
            await _appContext.SaveChangesAsync();

            return (await Get(element.Id))!;
        }
    }
}
