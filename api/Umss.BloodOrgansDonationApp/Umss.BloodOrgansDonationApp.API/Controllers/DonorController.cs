using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    /// <summary>
    /// Donor search for any signed-in user. Returns public fields only (name, photo, blood type):
    /// the full profile with personal data is <c>/api/me</c> (yourself) or <c>/api/users</c> (network admins).
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/donors")]
    public class DonorController : ControllerBase
    {
        private readonly IDonorService _donorService;

        public DonorController(IDonorService donorService)
        {
            _donorService = donorService;
        }

        /// <summary>One page of donors, ordered by name; search by name, filter by blood type or city.</summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<PagedResult<DonorResponse>>> Get([FromQuery] DonorQuery query)
        {
            return Ok(await _donorService.GetAll(query));
        }

        /// <summary>One donor.</summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DonorResponse>> Get(Guid id)
        {
            DonorResponse? donor = await _donorService.Get(id);
            if (donor == null)
            {
                return NotFound($"Donor with ID {id} not found.");
            }

            return Ok(donor);
        }
    }
}
