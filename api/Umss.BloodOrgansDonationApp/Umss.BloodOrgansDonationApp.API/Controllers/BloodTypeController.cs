using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umss.BloodOrgansDonationApp.Models;
using Umss.BloodOrgansDonationApp.Models.Entities;
using Umss.BloodOrgansDonationApp.Models.Requests;
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
        public async Task<ActionResult<Response<BloodType>>> Get(Guid id)
        {
            BloodType? response = await _bloodTypeService.Get(id);
            if (response == null)
            {
                return NotFound($"Blood type with ID {id} not found.");
            }

            return Ok(response);
        }

        //TODO: Implement a soft delete
        [Authorize(Roles = "Admin")]
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

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<Response<IEnumerable<BloodType>>>> Get()
        {
            IEnumerable<BloodType> response = await _bloodTypeService.GetAll();
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<BloodType>> Create([FromBody] BloodTypeRequest bloodTypeRequest)
        {
            BloodType response = await _bloodTypeService.Create(bloodTypeRequest);
            return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<BloodType>> Update(Guid id, [FromBody] BloodTypeRequest bloodTypeRequest)
        {
            BloodType response = await _bloodTypeService.Update(id, bloodTypeRequest);
            return Ok(response);
        }
    }
}
