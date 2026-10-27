using Microsoft.EntityFrameworkCore;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Repository.Data;
using Umss.BloodOrgansDonationApp.Repository.Extensions;
using Umss.BloodOrgansDonationApp.Repository.Interfaces;

namespace Umss.BloodOrgansDonationApp.Repository
{
    public class DonationRequestRepository : IDonationRequestRepository
    {
        private const string FolioPrefix = "req-";

        private readonly DonationAppContext _appContext;

        public DonationRequestRepository(DonationAppContext appContext)
        {
            _appContext = appContext;
        }

        public Task<PagedResult<DonationPost>> Get(DonationRequestQuery query, bool searchPatientCode)
        {
            IQueryable<DonationPost> requests = Filter(Requests(), query, searchPatientCode);

            return WithDetails(requests)
                .OrderBy(r => r.Urgency == Urgency.CodeRed ? 0 : r.Urgency == Urgency.Priority ? 1 : 2)
                .ThenBy(r => r.Deadline == null)
                .ThenBy(r => r.Deadline)
                .ThenByDescending(r => r.CreatedAt)
                .ThenBy(r => r.Id)
                .ToPagedResultAsync(query);
        }

        public Task<DonationPost?> Get(Guid id)
        {
            return WithDetails(Requests()).FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<DonationPost> Create(DonationPost request, DonationRequestStatusChange created)
        {
            _appContext.DonationPosts.Add(request);
            _appContext.DonationRequestStatusChanges.Add(created);
            await _appContext.SaveChangesAsync();

            return await WithDetails(Requests()).FirstAsync(r => r.Id == request.Id);
        }

        public async Task<DonationPost> Save(DonationPost request, RequestState seen, DonationRequestStatusChange? change)
        {
            DonationPost tracked = await _appContext.DonationPosts.FindAsync(request.Id)
                ?? throw new EntityNotFoundException($"Donation request with ID {request.Id} not found.");

            var entry = _appContext.Entry(tracked);
            entry.CurrentValues.SetValues(request);

            // Compare against what the caller saw, not what FindAsync just read: a change made by
            // someone else at any point after the caller's read makes the UPDATE match no row.
            entry.Property(r => r.Status).OriginalValue = seen.Status;
            entry.Property(r => r.UnitsCovered).OriginalValue = seen.UnitsCovered;

            if (change != null)
            {
                _appContext.DonationRequestStatusChanges.Add(change);
            }

            try
            {
                await _appContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("La solicitud fue modificada por otra persona. Recarga el tablero e intenta de nuevo.");
            }

            return await WithDetails(Requests()).FirstAsync(r => r.Id == request.Id);
        }

        public async Task<IReadOnlyList<string>> FindMissingReferences(Guid bloodTypeId, Guid donationTypeId, Guid donationCenterId)
        {
            List<string> missing = new List<string>();
            if (!await _appContext.BloodTypes.AnyAsync(b => b.Id == bloodTypeId))
            {
                missing.Add(nameof(DonationPost.BloodTypeId));
            }

            if (!await _appContext.DonationTypes.AnyAsync(d => d.Id == donationTypeId))
            {
                missing.Add(nameof(DonationPost.DonationTypeId));
            }

            if (!await _appContext.DonationCenters.AnyAsync(c => c.Id == donationCenterId))
            {
                missing.Add(nameof(DonationPost.DonationCenterId));
            }

            return missing;
        }

        private IQueryable<DonationPost> Requests()
        {
            return _appContext.DonationPosts.AsNoTracking().Where(r => r.Status != null);
        }

        private static IQueryable<DonationPost> WithDetails(IQueryable<DonationPost> requests)
        {
            return requests
                .Include(r => r.BloodType)
                .Include(r => r.DonationType)
                .Include(r => r.User)
                .Include(r => r.DonationCenter)
                .Include(r => r.StatusChangedBy);
        }

        private static IQueryable<DonationPost> Filter(IQueryable<DonationPost> requests, DonationRequestQuery query, bool searchPatientCode)
        {
            string? search = query.NormalizedSearch();
            if (search != null)
            {
                string folioText = search.StartsWith(FolioPrefix, StringComparison.Ordinal) ? search[FolioPrefix.Length..] : search;
                int folio = int.TryParse(folioText, out int parsed) ? parsed : -1;

                requests = searchPatientCode
                    ? requests.Where(r => r.Title.ToLower().Contains(search)
                        || r.Description.ToLower().Contains(search)
                        || r.Folio == folio
                        || (r.PatientCode != null && r.PatientCode.ToLower().Contains(search)))
                    : requests.Where(r => r.Title.ToLower().Contains(search)
                        || r.Description.ToLower().Contains(search)
                        || r.Folio == folio);
            }

            if (query.Urgency.HasValue)
            {
                Urgency urgency = query.Urgency.Value;
                requests = requests.Where(r => r.Urgency == urgency);
            }

            if (query.Component.HasValue)
            {
                BloodComponent component = query.Component.Value;
                requests = requests.Where(r => r.Component == component);
            }

            if (query.BloodTypeId is { Count: > 0 })
            {
                List<Guid> bloodTypeIds = query.BloodTypeId.Distinct().ToList();
                requests = requests.Where(r => bloodTypeIds.Contains(r.BloodTypeId));
            }

            if (query.Status.HasValue)
            {
                RequestStatus status = query.Status.Value;
                requests = requests.Where(r => r.Status == status);
            }

            if (query.Open.HasValue)
            {
                requests = query.Open.Value
                    ? requests.Where(r => r.Status != RequestStatus.Completed && r.Status != RequestStatus.Cancelled)
                    : requests.Where(r => r.Status == RequestStatus.Completed || r.Status == RequestStatus.Cancelled);
            }

            if (query.DonationCenterId.HasValue)
            {
                Guid donationCenterId = query.DonationCenterId.Value;
                requests = requests.Where(r => r.DonationCenterId == donationCenterId);
            }

            if (query.StatusChangedSince.HasValue)
            {
                DateTime since = AsUtc(query.StatusChangedSince.Value);
                requests = requests.Where(r => r.StatusChangedAt >= since);
            }

            return requests;
        }

        /// <summary>Npgsql only accepts UTC for timestamp with time zone; a time without an offset is read as UTC.</summary>
        private static DateTime AsUtc(DateTime value) => value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };
    }
}
