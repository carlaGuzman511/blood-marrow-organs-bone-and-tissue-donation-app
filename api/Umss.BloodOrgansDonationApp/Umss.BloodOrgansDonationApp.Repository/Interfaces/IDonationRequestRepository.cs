using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Repository.Interfaces
{
    /// <summary>The phase and unit count a caller saw when they read the request.</summary>
    public sealed record RequestState(RequestStatus? Status, int UnitsCovered);

    /// <summary>
    /// Clinical donation requests: the rows of DonationPosts that have a phase (Status not null).
    /// Plain feed posts are never returned here.
    /// </summary>
    public interface IDonationRequestRepository
    {
        /// <summary>
        /// One page, most urgent first (Codigo Rojo, then Prioritario), then the nearest deadline.
        /// <paramref name="searchPatientCode"/> lets the search match patient codes (clinical callers only).
        /// </summary>
        Task<PagedResult<DonationPost>> Get(DonationRequestQuery query, bool searchPatientCode);

        /// <summary>The request with its blood type, donation type, center and authors; null when it doesn't exist or is a plain post.</summary>
        Task<DonationPost?> Get(Guid id);

        /// <summary>Saves a new request and the first entry of its history in one transaction.</summary>
        Task<DonationPost> Create(DonationPost request, DonationRequestStatusChange created);

        /// <summary>
        /// Saves the request's values, plus <paramref name="change"/> when the phase moved. Throws
        /// ConflictException when its phase or unit count is no longer <paramref name="seen"/>.
        /// </summary>
        Task<DonationPost> Save(DonationPost request, RequestState seen, DonationRequestStatusChange? change);

        /// <summary>Names of the referenced rows that don't exist ("BloodTypeId", "DonationTypeId", "DonationCenterId").</summary>
        Task<IReadOnlyList<string>> FindMissingReferences(Guid bloodTypeId, Guid donationTypeId, Guid donationCenterId);
    }
}
