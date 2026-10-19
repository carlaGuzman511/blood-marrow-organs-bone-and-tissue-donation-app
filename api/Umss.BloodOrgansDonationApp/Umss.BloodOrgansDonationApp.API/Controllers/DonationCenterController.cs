using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
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

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonationCenterResponse>>> Get()
        {
            IEnumerable<DonationCenterResponse> response = await _donationCenterService.GetAll();
            return Ok(response);
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
