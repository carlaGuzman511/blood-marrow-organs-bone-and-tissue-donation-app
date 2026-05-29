using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models.Exceptions;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [Controller]
    [Route("api/users")]
    public class UserController: ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            this._userService = userService;
        }

        //[Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> Get(Guid id)
        {
            try
            {
                UserResponse? response = await _userService.Get(id);
                if (response == null) { 
                    return NotFound($"User with ID {id} not found.");
                }

                return Ok(response);
            }
            catch (ValidationException exception)
            {
                return BadRequest(new { errors = exception.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}, {ex.InnerException?.Message}");
            }
        }

        //[Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> Get()
        {
            try
            {
                IEnumerable<UserResponse> response = await _userService.GetAll();
                return Ok(response);
            }
            catch (ValidationException exception)
            {
                return BadRequest(new { errors = exception.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}, {ex.InnerException?.Message}");
            }
        }

        //TODO: implement a soft delete
        //[Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                UserResponse? response = await _userService.Get(id);
                if (response == null)
                {
                    return NotFound($"User with ID {id} not found.");
                }

                await _userService.Delete(id);
                return NoContent();
            }
            catch (ValidationException exception)
            {
                return BadRequest(new { errors = exception.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}, {ex.InnerException?.Message}");
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Create([FromBody] UserRequest userRequest)
        {
            try
            {
                UserResponse response = await _userService.Create(userRequest);
                return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
            }
            catch (ValidationException exception)
            {
                return BadRequest(new { errors = exception.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}, {ex.InnerException?.Message}");
            }
        }
        
        //[Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponse>> Update(Guid id, [FromBody] UserRequest userRequest)
        {
            try
            {
                UserResponse response = await _userService.Update(id, userRequest);
                return Ok(response);
            }
            catch (EntityNotFoundException exception)
            {
                return NotFound(exception.Message);
            }
            catch (ValidationException exception)
            {
                return BadRequest(new { errors = exception.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}, {ex.InnerException?.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                AuthResponse response = await _userService.LoginAsync(loginRequest);
                if (response == null)
                    return Unauthorized("Invalid credentials");

                return StatusCode(StatusCodes.Status200OK, response);
            }
            catch (ValidationException exception)
            {
                return BadRequest(new { errors = exception.Errors.Select(e => e.ErrorMessage) });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"{ex.Message}, {ex.InnerException?.Message}");
            }
        }
    }
}
