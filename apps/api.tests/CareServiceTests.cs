using CareFlow.Api.DTOs;
using CareFlow.Api.Models;
using CareFlow.Api.Services;

namespace CareFlow.Api.Tests;

public class CareServiceTests
{
    private static (CareService service, FakeCareDataProvider provider) CreateSut()
    {
        var provider = new FakeCareDataProvider();
        var service = new CareService(provider);
        return (service, provider);
    }

    private static Patient MakePatient(string name = "John Doe", Priority priority = Priority.High) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        DateOfBirth = "1980-01-01",
        Priority = priority,
        AssignedProvider = "Dr. Test"
    };

    private static CareTask MakeTask(Patient patient, Priority priority = Priority.High, Models.TaskStatus status = Models.TaskStatus.Pending) => new()
    {
        Id = Guid.NewGuid(),
        PatientId = patient.Id,
        Patient = patient,
        Title = "Follow up",
        Priority = priority,
        Status = status,
        DueDate = DateTime.UtcNow.Date,
        Notes = null
    };

    [Fact]
    public async Task GetPatientsAsync_ReturnsAllPatientsAsDtos()
    {
        var (service, provider) = CreateSut();
        provider.Patients.Add(MakePatient("Jane Smith"));
        provider.Patients.Add(MakePatient("John Doe"));

        var result = await service.GetPatientsAsync();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, p => p.Name == "John Doe");
    }

    [Fact]
    public async Task GetPatientByIdAsync_ReturnsDetailWithTasks_WhenPatientExists()
    {
        var (service, provider) = CreateSut();
        var patient = MakePatient();
        var task = MakeTask(patient);
        patient.Tasks.Add(task);
        provider.Patients.Add(patient);

        var result = await service.GetPatientByIdAsync(patient.Id);

        Assert.NotNull(result);
        Assert.Equal(patient.Name, result!.Name);
        Assert.Single(result.Tasks);
    }

    [Fact]
    public async Task GetPatientByIdAsync_ReturnsNull_WhenPatientDoesNotExist()
    {
        var (service, _) = CreateSut();

        var result = await service.GetPatientByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCareTasksAsync_ReturnsAllTasksAsDtos()
    {
        var (service, provider) = CreateSut();
        var patient = MakePatient();
        provider.Tasks.Add(MakeTask(patient));
        provider.Tasks.Add(MakeTask(patient, priority: Priority.Low));

        var result = await service.GetCareTasksAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task UpdateCareTaskStatusAsync_UpdatesStatus_WhenTaskExistsAndStatusValid()
    {
        var (service, provider) = CreateSut();
        var patient = MakePatient();
        var task = MakeTask(patient, status: Models.TaskStatus.Pending);
        provider.Tasks.Add(task);

        var (result, error) = await service.UpdateCareTaskStatusAsync(task.Id, new UpdateTaskDto("completed"));

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal("completed", result!.Status);
    }

    [Fact]
    public async Task UpdateCareTaskStatusAsync_ReturnsError_WhenStatusInvalid()
    {
        var (service, provider) = CreateSut();
        var patient = MakePatient();
        var task = MakeTask(patient);
        provider.Tasks.Add(task);

        var (result, error) = await service.UpdateCareTaskStatusAsync(task.Id, new UpdateTaskDto("not-a-status"));

        Assert.Null(result);
        Assert.NotNull(error);
    }

    [Fact]
    public async Task UpdateCareTaskStatusAsync_ReturnsNullTaskAndNoError_WhenTaskNotFound()
    {
        var (service, _) = CreateSut();

        var (result, error) = await service.UpdateCareTaskStatusAsync(Guid.NewGuid(), new UpdateTaskDto("completed"));

        Assert.Null(result);
        Assert.Null(error);
    }
}
