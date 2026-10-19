using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api/donation-types")]
    public class DonationTypeController: ControllerBase
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

        [Authorize(Roles = "Admin")]
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

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonationTypeResponse>>> Get()
        {
            IEnumerable<DonationTypeResponse> response = await _donationTypeService.GetAll();
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<DonationTypeResponse>> Create([FromBody] DonationTypeRequest donationTypeRequest)
        {
            DonationTypeResponse response = await _donationTypeService.Create(donationTypeRequest);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<DonationTypeResponse>> Update(Guid id, [FromBody] DonationTypeRequest donationTypeRequest)
        {
            DonationTypeResponse response = await _donationTypeService.Update(id, donationTypeRequest);
            return Ok(response);
        }
    }
}
