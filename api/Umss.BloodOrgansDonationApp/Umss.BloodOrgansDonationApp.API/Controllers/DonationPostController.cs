using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class DonationPostController : ControllerBase
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
            if (response == null)
            {
                return NotFound($"Donation Post ID {donationPostId}, and User ID {userId} not found.");
            }

            return Ok(response);
        }

        /// <summary>One page of the feed, newest first; search by title or description, filter by blood type, donation type, center or priority. An empty feed is 200 with no items.</summary>
        [Authorize]
        [HttpGet("donation-posts")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        public async Task<ActionResult<PagedResult<DonationPostResponse>>> Get([FromQuery] DonationPostQuery query)
        {
            return Ok(await _DonationPostService.Get(query));
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

        /// <summary>One page of a user's posts, newest first (same filters as the feed).</summary>
        [Authorize]
        [HttpGet("users/{userId}/donation-posts")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        public async Task<ActionResult<PagedResult<DonationPostResponse>>> GetByUser(Guid userId, [FromQuery] DonationPostQuery query)
        {
            return Ok(await _DonationPostService.GetByUser(userId, query));
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

        /// <summary>One page of a center's posts, newest first (same filters as the feed).</summary>
        [Authorize]
        [HttpGet("donation-centers/{donationCenterId}/donation-posts")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        public async Task<ActionResult<PagedResult<DonationPostResponse>>> GetByDonationCenter(Guid donationCenterId, [FromQuery] DonationPostQuery query)
        {
            return Ok(await _DonationPostService.GetByDonationCenter(donationCenterId, query));
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
