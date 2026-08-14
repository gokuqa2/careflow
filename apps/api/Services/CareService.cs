using CareFlow.Api.DTOs;
using CareFlow.Api.Models;

namespace CareFlow.Api.Services;

public class CareService(ICareDataProvider provider)
{
    public async Task<List<PatientDto>> GetPatientsAsync()
    {
        var patients = await provider.GetPatientsAsync();
        return patients.Select(ToPatientDto).ToList();
    }

    public async Task<PatientDetailDto?> GetPatientByIdAsync(Guid id)
    {
        var patient = await provider.GetPatientByIdAsync(id);
        if (patient is null) return null;

        return new PatientDetailDto(
            patient.Id,
            patient.Name,
            patient.DateOfBirth,
            patient.Priority.ToString().ToLower(),
            patient.AssignedProvider,
            patient.Tasks.Select(ToCareTaskDto).ToList()
        );
    }

    public async Task<List<CareTaskDto>> GetCareTasksAsync()
    {
        var tasks = await provider.GetCareTasksAsync();
        return tasks.Select(ToCareTaskDto).ToList();
    }

    public async Task<(CareTaskDto? task, string? error)> UpdateCareTaskStatusAsync(Guid id, UpdateTaskDto dto)
    {
        if (!Enum.TryParse<Models.TaskStatus>(dto.Status, ignoreCase: true, out var newStatus))
            return (null, $"Invalid status '{dto.Status}'. Valid values: pending, completed.");

        var task = await provider.GetCareTaskByIdAsync(id);
        if (task is null) return (null, null);

        task.Status = newStatus;
        await provider.UpdateCareTaskAsync(task);

        return (ToCareTaskDto(task), null);
    }

    private static PatientDto ToPatientDto(Patient p) =>
        new(p.Id, p.Name, p.Priority.ToString().ToLower(), p.AssignedProvider);

    private static CareTaskDto ToCareTaskDto(CareTask t) =>
        new(
            t.Id,
            t.PatientId,
            t.Patient?.Name ?? string.Empty,
            t.Title,
            t.Priority.ToString().ToLower(),
            t.Status.ToString().ToLower(),
            t.DueDate.ToString("yyyy-MM-dd"),
            t.Notes
        );
}
