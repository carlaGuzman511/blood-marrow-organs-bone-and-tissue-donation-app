using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api/donation-centers")]
    public class DonationCenterController : ControllerBase
    {
        private readonly IDonationCenterService _donationCenterService;

        public DonationCenterController(IDonationCenterService donationCenterService)
        {
            _donationCenterService = donationCenterService;
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<DonationCenterResponse>> Get(Guid id)
        {
            DonationCenterResponse? response = await _donationCenterService.Get(id);
            if (response == null)
            {
                return NotFound($"Donation Center with ID {id} not found.");
            }

            return Ok(response);
        }

        /// <summary>One page of donation centers, ordered by name; search by name or address, filter by city or donation type.</summary>
        [Authorize]
        [HttpGet]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResult<DonationCenterResponse>>> Get([FromQuery] DonationCenterQuery query)
        {
            return Ok(await _donationCenterService.GetAll(query));
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            DonationCenterResponse? response = await _donationCenterService.Get(id);
            if (response == null)
            {
                return NotFound($"Donation Center with ID {id} not found.");
            }

            await _donationCenterService.Delete(id);
            return NoContent();

        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<DonationCenterResponse>> Create([FromBody] DonationCenterRequest donationCenterRequest)
        {
            DonationCenterResponse response = await _donationCenterService.Create(donationCenterRequest);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<DonationCenterResponse>> Update(Guid id, [FromBody] DonationCenterRequest donationCenterRequest)
        {
            DonationCenterResponse response = await _donationCenterService.Update(id, donationCenterRequest);
            return Ok(response);
        }
    }
}
