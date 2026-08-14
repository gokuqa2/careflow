using CareFlow.Api.Models;
using CareFlow.Api.Services;

namespace CareFlow.Api.Tests;

/// <summary>In-memory stand-in for ICareDataProvider, used to unit test CareService and controllers.</summary>
public class FakeCareDataProvider : ICareDataProvider
{
    public List<Patient> Patients { get; } = new();
    public List<CareTask> Tasks { get; } = new();

    public Task<List<Patient>> GetPatientsAsync() =>
        Task.FromResult(Patients.OrderBy(p => p.Name).ToList());

    public Task<Patient?> GetPatientByIdAsync(Guid id) =>
        Task.FromResult(Patients.FirstOrDefault(p => p.Id == id));

    public Task<List<CareTask>> GetCareTasksAsync() =>
        Task.FromResult(Tasks.OrderBy(t => t.DueDate).ToList());

    public Task<CareTask?> GetCareTaskByIdAsync(Guid id) =>
        Task.FromResult(Tasks.FirstOrDefault(t => t.Id == id));

    public Task UpdateCareTaskAsync(CareTask task)
    {
        var index = Tasks.FindIndex(t => t.Id == task.Id);
        if (index != -1) Tasks[index] = task;
        return Task.CompletedTask;
    }
}
