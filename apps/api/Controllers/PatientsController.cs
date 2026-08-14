using CareFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareFlow.Api.Controllers;

[ApiController]
[Route("api/patients")]
public class PatientsController(CareService careService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await careService.GetPatientsAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var patient = await careService.GetPatientByIdAsync(id);
        return patient is null ? NotFound(new { error = $"Patient {id} not found." }) : Ok(patient);
    }
}
