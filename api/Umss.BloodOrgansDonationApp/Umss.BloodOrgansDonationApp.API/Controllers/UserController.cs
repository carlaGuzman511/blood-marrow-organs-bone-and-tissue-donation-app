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
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            this._userService = userService;
        }

        /// <summary>A user's profile: only the user themself or a network admin (403 otherwise). Prefer GET /api/me.</summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> Get(Guid id)
        {
            UserResponse? response = await _userService.Get(id);
            if (response == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            return Ok(response);
        }

        /// <summary>One page of users, ordered by name; search by name or email. Network admins only: profiles hold personal data.</summary>
        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        public async Task<ActionResult<PagedResult<UserResponse>>> Get([FromQuery] UserQuery query)
        {
            return Ok(await _userService.GetAll(query));
        }

        //TODO: implement a soft delete
        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            UserResponse? response = await _userService.Get(id);
            if (response == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            await _userService.Delete(id);
            return NoContent();
        }

        /// <summary>Deprecated: accounts live in Keycloak. Sign in with Keycloak and use POST /api/me.</summary>
        [Obsolete("Accounts live in Keycloak: sign in there and create the profile with POST /api/me.")]
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Create([FromBody] UserRequest userRequest)
        {
            UserResponse response = await _userService.Create(userRequest);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        /// <summary>Updates a user: only the user themself or a network admin (403 otherwise). Prefer PUT /api/me.</summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponse>> Update(Guid id, [FromBody] UserRequest userRequest)
        {
            UserResponse response = await _userService.Update(id, userRequest);
            return Ok(response);
        }

        /// <summary>Deprecated: sign in with Keycloak instead. Tokens issued here are not accepted by this API.</summary>
        [Obsolete("Sign in with Keycloak; this endpoint's tokens are not accepted by the API.")]
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest loginRequest)
        {
            AuthResponse response = await _userService.LoginAsync(loginRequest);
            if (response == null)
                return Unauthorized("Invalid credentials");

            return StatusCode(StatusCodes.Status200OK, response);
        }
    }
}
