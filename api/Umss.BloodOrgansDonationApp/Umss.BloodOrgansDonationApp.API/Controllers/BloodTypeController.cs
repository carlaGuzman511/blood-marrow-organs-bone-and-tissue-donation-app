using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.API.Security;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests;
using Umss.BloodOrgansDonationApp.Models.Requests.Queries;
using Umss.BloodOrgansDonationApp.Models.Responses;
using Umss.BloodOrgansDonationApp.Services.Interfaces;

namespace Umss.BloodOrgansDonationApp.API.Controllers
{
    [ApiController]
    [Route("api/blood-types")]
    public class BloodTypeController : ControllerBase
    {
        private readonly IBloodTypeService _bloodTypeService;

        public BloodTypeController(IBloodTypeService bloodTypeService)
        {
            _bloodTypeService = bloodTypeService;
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<BloodType>> Get(Guid id)
        {
            BloodType? response = await _bloodTypeService.Get(id);
            if (response == null)
            {
                return NotFound($"Blood type with ID {id} not found.");
            }

            return Ok(response);
        }

        //TODO: Implement a soft delete
        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            BloodType? response = await _bloodTypeService.Get(id);
            if (response == null)
            {
                return NotFound($"Blood Type with ID {id} not found.");
            }

            await _bloodTypeService.Delete(id);
            return NoContent();
        }

        /// <summary>One page of blood types, ordered by name. The list is small: use pageSize=100 for a dropdown.</summary>
        [Authorize]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest, "application/problem+json")]
        public async Task<ActionResult<PagedResult<BloodType>>> Get([FromQuery] BloodTypeQuery query)
        {
            return Ok(await _bloodTypeService.GetAll(query));
        }

        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpPost]
        public async Task<ActionResult<BloodType>> Create([FromBody] BloodTypeRequest bloodTypeRequest)
        {
            BloodType response = await _bloodTypeService.Create(bloodTypeRequest);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [Authorize(Policy = AppPolicies.NetworkAdmin)]
        [HttpPut("{id}")]
        public async Task<ActionResult<BloodType>> Update(Guid id, [FromBody] BloodTypeRequest bloodTypeRequest)
        {
            BloodType response = await _bloodTypeService.Update(id, bloodTypeRequest);
            return Ok(response);
        }
    }
}
