using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.API.Security;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api/donation-types")]
    public class DonationTypeController : ControllerBase
    {
        private readonly IDonationTypeService _donationTypeService;

        public DonationTypeController(IDonationTypeService donationTypeService)
        {
            _donationTypeService = donationTypeService;
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<DonationTypeResponse>> Get(Guid id)
        {
            DonationTypeResponse? response = await _donationTypeService.Get(id);
            if (response == null)
            {
                return NotFound($"Donation Type with ID {id} not found.");
            }

            return Ok(response);
        }

        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            DonationTypeResponse? donationType = await _donationTypeService.Get(id);
            if (donationType == null)
            {
                return NotFound($"Donation Type with ID {id} not found.");
            }

            await _donationTypeService.Delete(id);
            return NoContent();
        }

        /// <summary>One page of donation types, ordered by name; search by name.</summary>
        [Authorize]
        [HttpGet]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResult<DonationTypeResponse>>> Get([FromQuery] DonationTypeQuery query)
        {
            return Ok(await _donationTypeService.GetAll(query));
        }

        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpPost]
        public async Task<ActionResult<DonationTypeResponse>> Create([FromBody] DonationTypeRequest donationTypeRequest)
        {
            DonationTypeResponse response = await _donationTypeService.Create(donationTypeRequest);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpPut("{id}")]
        public async Task<ActionResult<DonationTypeResponse>> Update(Guid id, [FromBody] DonationTypeRequest donationTypeRequest)
        {
            DonationTypeResponse response = await _donationTypeService.Update(id, donationTypeRequest);
            return Ok(response);
        }
    }
}
