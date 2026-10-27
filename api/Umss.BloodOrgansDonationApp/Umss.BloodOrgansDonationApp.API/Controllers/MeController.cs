using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    /// <summary>
    /// The signed-in user's own profile. The user is always the one in the token: there is no id to pass,
    /// so nobody can read or change someone else's profile here.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/me")]
    public class MeController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public MeController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        /// <summary>Returns the caller's profile. 404 means the app must show "complete your profile".</summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserResponse>> Get()
        {
            return Ok(await _profileService.Get());
        }

        /// <summary>Creates the caller's profile. Email comes from the token; 409 if the caller already has one.</summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserResponse>> Create([FromBody] ProfileRequest profileRequest)
        {
            UserResponse response = await _profileService.Create(profileRequest);
            return CreatedAtAction(nameof(Get), null, response);
        }

        /// <summary>Updates the caller's profile.</summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserResponse>> Update([FromBody] ProfileRequest profileRequest)
        {
            return Ok(await _profileService.Update(profileRequest));
        }
    }
}
