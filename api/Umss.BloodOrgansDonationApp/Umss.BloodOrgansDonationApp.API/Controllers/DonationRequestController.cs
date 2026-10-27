using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.API.Security;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    /// <summary>
    /// Clinical donation requests (US-API-01) and their triage phases (US-API-02): the portal's
    /// tactical board and the mobile feed of urgencies. Enums travel as text ("CodeRed").
    /// </summary>
    [ApiController]
    [Route("api/donation-requests")]
    public class DonationRequestController : ControllerBase
    {
        private readonly IDonationRequestService _service;

        public DonationRequestController(IDonationRequestService service)
        {
            _service = service;
        }

        /// <summary>
        /// One page of requests, most urgent first (Codigo Rojo, Prioritario, Estandar), then the
        /// nearest deadline. Filters run in the database. Patient data comes only to clinical staff,
        /// admins and the author.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        public async Task<ActionResult<PagedResult<DonationRequestResponse>>> Get([FromQuery] DonationRequestQuery query)
        {
            return Ok(await _service.Get(query));
        }

        /// <summary>One request with its unit progress and, while open, the seconds left until its deadline.</summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound, "application/problem+json")]
        public async Task<ActionResult<DonationRequestResponse>> Get(Guid id)
        {
            DonationRequestResponse? response = await _service.Get(id);
            if (response == null)
            {
                return NotFound();
            }

            return Ok(response);
        }

        /// <summary>
        /// Publishes a request in phase SearchingDonors with 0 units covered. The caller is the author
        /// and needs a profile, unless they are clinical staff or an admin.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden, "application/problem+json")]
        public async Task<ActionResult<DonationRequestResponse>> Create([FromBody] DonationRequestRequest request)
        {
            DonationRequestResponse response = await _service.Create(request);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        /// <summary>Edits an open request (author, clinical staff or admin). Phase and covered units have their own endpoints.</summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict, "application/problem+json")]
        public async Task<ActionResult<DonationRequestResponse>> Update(Guid id, [FromBody] DonationRequestRequest request)
        {
            return Ok(await _service.Update(id, request));
        }

        /// <summary>
        /// Moves the request to another phase and records who and when. 409 when the move isn't
        /// allowed (e.g. Completed to SearchingDonors) or someone else changed it first.
        /// Moving to the phase it already has is a no-op.
        /// </summary>
        [HttpPatch("{id:guid}/status")]
        [Authorize(Policy = AppPolicies.ClinicalStaff)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict, "application/problem+json")]
        public async Task<ActionResult<DonationRequestResponse>> ChangeStatus(Guid id, [FromBody] RequestStatusChangeRequest request)
        {
            return Ok(await _service.ChangeStatus(id, request));
        }

        /// <summary>
        /// Registers units received and validated. Reaching the required units completes the request.
        /// 409 when it is closed or the units exceed what is missing.
        /// </summary>
        [HttpPost("{id:guid}/units")]
        [Authorize(Policy = AppPolicies.ClinicalStaff)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound, "application/problem+json")]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict, "application/problem+json")]
        public async Task<ActionResult<DonationRequestResponse>> RegisterUnits(Guid id, [FromBody] RequestUnitsRequest request)
        {
            return Ok(await _service.RegisterUnits(id, request));
        }
    }
}
