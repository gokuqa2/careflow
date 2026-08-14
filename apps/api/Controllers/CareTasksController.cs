using CareFlow.Api.DTOs;
using CareFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareFlow.Api.Controllers;

[ApiController]
[Route("api/care-tasks")]
public class CareTasksController(CareService careService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await careService.GetCareTasksAsync());

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var (task, validationError) = await careService.UpdateCareTaskStatusAsync(id, dto);

        if (validationError is not null)
            return BadRequest(new { error = validationError });

        if (task is null)
            return NotFound(new { error = $"Task {id} not found." });

        return Ok(task);
    }
}
