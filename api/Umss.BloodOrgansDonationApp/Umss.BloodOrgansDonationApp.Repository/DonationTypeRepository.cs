using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Extensions;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;

namespace Umss.BloodOrgansDonationApp.Repository
{
    public class DonationTypeRepository : IDonationTypeRepository
    {
        private readonly DonationAppContext _appContext;

        public DonationTypeRepository(DonationAppContext appContext)
        {
            _appContext = appContext;
        }
        public async Task<DonationType> Create(DonationType element)
        {
            await _appContext.AddAsync(element);
            await _appContext.SaveChangesAsync();
            return element;
        }

        //TODO: Implement a soft delete due foreign key issues.
        public async Task Delete(Guid id)
        {
            DonationType? donationType = await Get(id);
            if (donationType != null)
            {
                _appContext.Remove(donationType);
                await _appContext.SaveChangesAsync();
            }
        }

        public async Task<DonationType?> Get(Guid id)
        {
            return await _appContext.DonationTypes.FindAsync(id);
        }

        public async Task<PagedResult<DonationType>> GetAll(DonationTypeQuery query)
        {
            IQueryable<DonationType> donationTypes = _appContext.DonationTypes.AsNoTracking();

            string? search = query.NormalizedSearch();
            if (search != null)
            {
                donationTypes = donationTypes.Where(dt => dt.Name.ToLower().Contains(search));
            }

            return await donationTypes
                .OrderBy(dt => dt.Name)
                .ThenBy(dt => dt.Id)
                .ToPagedResultAsync(query);
        }

        public async Task<IEnumerable<DonationType>> GetByIds(IEnumerable<Guid> donationTypeIds)
        {
            return await _appContext.DonationTypes.AsNoTracking().Where(x => donationTypeIds.Contains(x.Id)).ToListAsync();
        }

        public async Task<DonationType> Update(DonationType element)
        {
            await _appContext.SaveChangesAsync();
            return element;
        }
    }
}
