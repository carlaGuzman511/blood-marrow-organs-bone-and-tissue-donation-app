using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [Authorize]
        [HttpGet("{donationPostId}/comments/{commentId}")]
        public async Task<ActionResult<CommentResponse>> Get(Guid donationPostId, Guid commentId)
        {
            CommentResponse? response = await _commentService.Get(donationPostId, commentId);
            if (response == null)
            {
                return NotFound($"Comment with ID {commentId} not found.");
            }

            return Ok(response);
        }

        [Authorize]
        [HttpGet("{donationPostId}/comments")]
        public async Task<ActionResult<IEnumerable<CommentResponse>>> Get(Guid donationPostId)
        {
            IEnumerable<CommentResponse> response = await _commentService.Get(donationPostId);
            return Ok(response);
        }

        [Authorize]
        [HttpDelete("{donationPostId}/comments/{commentId}")]
        public async Task<ActionResult> Delete(Guid donationPostId, Guid commentId)
        {
            CommentResponse? response = await _commentService.Get(donationPostId, commentId);
            if (response == null)
            {
                return NotFound($"Comment with ID {commentId} not found.");
            }

            await _commentService.Delete(donationPostId, commentId);
            return NoContent();
        }

        [Authorize]
        [HttpPut("{donationPostId}/comments/{commentId}")]
        public async Task<ActionResult<CommentResponse>> Update(Guid donationPostId, Guid commentId, [FromBody] CommentRequest commentRequest)
        {
            CommentResponse response = await _commentService.Update(donationPostId, commentId, commentRequest);
            return Ok(response);
        }

        [Authorize]
        [HttpPost("{donationPostId}/comments")]
        public async Task<ActionResult<CommentResponse>> Create(Guid donationPostId, [FromBody] CommentRequest commentRequest)
        {
            CommentResponse response = await _commentService.Create(donationPostId, commentRequest);
            //return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
            return StatusCode(201, response);
        }
    }
}
