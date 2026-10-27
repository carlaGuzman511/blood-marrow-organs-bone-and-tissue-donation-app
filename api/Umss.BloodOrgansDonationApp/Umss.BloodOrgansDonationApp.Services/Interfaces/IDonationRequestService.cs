using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;

namespace Umss.BloodOrgansDonationApp.Services.Interfaces
{
    /// <summary>Clinical donation requests and their triage phases (US-API-01 / US-API-02).</summary>
    public interface IDonationRequestService
    {
        /// <summary>One page of requests, most urgent first.</summary>
        Task<PagedResult<DonationRequestResponse>> Get(DonationRequestQuery query);

        /// <summary>The request, or null when it doesn't exist.</summary>
        Task<DonationRequestResponse?> Get(Guid id);

        /// <summary>Publishes a request: phase SearchingDonors, 0 units covered, author from the token.</summary>
        Task<DonationRequestResponse> Create(DonationRequestRequest request);

        /// <summary>Edits an open request. Author, clinical staff or network admin only.</summary>
        Task<DonationRequestResponse> Update(Guid id, DonationRequestRequest request);

        /// <summary>Moves the request to another phase. Clinical staff or network admin; 409 on a move that isn't allowed.</summary>
        Task<DonationRequestResponse> ChangeStatus(Guid id, RequestStatusChangeRequest request);

        /// <summary>Adds covered units; reaching the required units completes the request.</summary>
        Task<DonationRequestResponse> RegisterUnits(Guid id, RequestUnitsRequest request);
    }
}
