using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class DonationPostController: ControllerBase
    {
        private readonly IDonationPostService _DonationPostService;

        public DonationPostController(IDonationPostService DonationPostService)
        {
            _DonationPostService = DonationPostService;
        }

        [Authorize]
        [HttpGet("users/{userId}/donation-posts/{donationPostId}")]
        public async Task<ActionResult<DonationPostResponse>> GetByUser(Guid userId, Guid donationPostId)
        {
            DonationPostResponse? response = await _DonationPostService.GetByUser(userId, donationPostId);
            if(response == null)
            {
                return NotFound($"Donation Post ID {donationPostId}, and User ID {userId} not found.");
            }

            return Ok(response);
        }

        [Authorize]
        [HttpGet("donation-posts")]
        public async Task<ActionResult<IEnumerable<DonationPostResponse>>> Get()
        {
            IEnumerable<DonationPostResponse> response = await _DonationPostService.Get();
            if (response.Count() == 0)
            {
                return NoContent();
            }

            return Ok(response);
        }

        [Authorize]
        [HttpDelete("users/{userId}/donation-posts/{donationPostId}")]
        public async Task<ActionResult> DeleteByUser(Guid userId, Guid donationPostId)
        {
            DonationPostResponse? response = await _DonationPostService.GetByUser(userId, donationPostId);
            if (response == null)
            {
                return NotFound($"Donation Post ID {donationPostId}, and User ID {userId} not found.");
            }

            await _DonationPostService.DeleteByUser(userId, donationPostId);
            return NoContent();
        }

        [Authorize]
        [HttpGet("users/{userId}/donation-posts")]
        public async Task<ActionResult<IEnumerable<DonationPostResponse>>> GetByUser(Guid userId)
        {
            IEnumerable<DonationPostResponse> response = await _DonationPostService.GetByUser(userId);
            return Ok(response);
        }

        [Authorize]
        [HttpPost("users/{userId}/donation-posts")]
        public async Task<ActionResult<DonationPostResponse>> CreateByUser(Guid userId, [FromBody] DonationPostRequest donationPostRequest)
        {
            DonationPostResponse response = await _DonationPostService.CreateByUser(userId, donationPostRequest);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        [Authorize]
        [HttpPut("users/{userId}/donation-posts/{donationPostId}")]
        public async Task<ActionResult<DonationPostResponse>> UpdateByUser(Guid userId, Guid donationPostId, [FromBody] DonationPostRequest donationPostRequest)
        {
            DonationPostResponse response = await _DonationPostService.UpdateByUser(userId, donationPostId, donationPostRequest);
            return Ok(response);
        }

        [Authorize]
        [HttpGet("donation-centers/{donationCenterId}/donation-posts/{donationPostId}")]
        public async Task<ActionResult<DonationPostResponse>> GetByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            DonationPostResponse? response = await _DonationPostService.GetByDonationCenter(donationCenterId, donationPostId);
            if (response == null)
            {
                return NotFound($"Donation Post ID {donationPostId}, and Donation Center ID {donationCenterId} not found.");
            }

            return Ok(response);
        }

        [Authorize]
        [HttpDelete("donation-centers/{donationCenterId}/donation-posts/{donationPostId}")]
        public async Task<ActionResult> DeleteByDonationCenter(Guid donationCenterId, Guid donationPostId)
        {
            DonationPostResponse? response = await _DonationPostService.GetByDonationCenter(donationCenterId, donationPostId);
            if (response == null)
            {
                return NotFound($"Donation Post ID {donationPostId}, and Donation Center ID {donationCenterId} not found.");
            }

            await _DonationPostService.DeleteByDonationCenter(donationCenterId, donationPostId);
            return NoContent();
        }

        [Authorize]
        [HttpGet("donation-centers/{donationCenterId}/donation-posts")]
        public async Task<ActionResult<IEnumerable<DonationPostResponse>>> GetByDonationCenter(Guid donationCenterId)
        {
            IEnumerable<DonationPostResponse> response = await _DonationPostService.GetByDonationCenter(donationCenterId);
            return Ok(response);
        }

        [Authorize]
        [HttpPost("donation-centers/{donationCenterId}/donation-posts")]
        public async Task<ActionResult<DonationPostResponse>> CreateByDonationCenter(Guid donationCenterId, [FromBody] DonationPostRequest donationPostRequest)
        {
            DonationPostResponse response = await _DonationPostService.CreateByDonationCenter(donationCenterId, donationPostRequest);
            return StatusCode(StatusCodes.Status201Created, response);
        }

        [Authorize]
        [HttpPut("donation-centers/{donationCenterId}/donation-posts/{donationPostId}")]
        public async Task<ActionResult<DonationPostResponse>> UpdateByDonationCenter(Guid donationCenterId, Guid donationPostId, [FromBody] DonationPostRequest donationPostRequest)
        {
            DonationPostResponse response = await _DonationPostService.UpdateByDonationCenter(donationCenterId, donationPostId, donationPostRequest);
            return Ok(response);
        }
    }
}
