using CareFlow.Api.Controllers;
using CareFlow.Api.DTOs;
using CareFlow.Api.Models;
using CareFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareFlow.Api.Tests;

public class PatientsControllerTests
{
    private static (PatientsController controller, FakeCareDataProvider provider) CreateSut()
    {
        var provider = new FakeCareDataProvider();
        var service = new CareService(provider);
        return (new PatientsController(service), provider);
    }

    [Fact]
    public async Task GetAll_Returns200_WithPatientList()
    {
        var (controller, provider) = CreateSut();
        provider.Patients.Add(new Patient { Id = Guid.NewGuid(), Name = "John Doe", DateOfBirth = "1980-01-01", Priority = Priority.High, AssignedProvider = "Dr. Test" });

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
    }

    [Fact]
    public async Task GetById_Returns404_WhenPatientDoesNotExist()
    {
        var (controller, _) = CreateSut();

        var result = await controller.GetById(Guid.NewGuid());

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFound.StatusCode);
    }

    [Fact]
    public async Task GetById_Returns200_WhenPatientExists()
    {
        var (controller, provider) = CreateSut();
        var patient = new Patient { Id = Guid.NewGuid(), Name = "John Doe", DateOfBirth = "1980-01-01", Priority = Priority.High, AssignedProvider = "Dr. Test" };
        provider.Patients.Add(patient);

        var result = await controller.GetById(patient.Id);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
    }
}

public class CareTasksControllerTests
{
    private static (CareTasksController controller, FakeCareDataProvider provider) CreateSut()
    {
        var provider = new FakeCareDataProvider();
        var service = new CareService(provider);
        return (new CareTasksController(service), provider);
    }

    private static CareTask AddTask(FakeCareDataProvider provider, Models.TaskStatus status = Models.TaskStatus.Pending)
    {
        var patient = new Patient { Id = Guid.NewGuid(), Name = "John Doe", DateOfBirth = "1980-01-01", Priority = Priority.High, AssignedProvider = "Dr. Test" };
        var task = new CareTask
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            Patient = patient,
            Title = "Follow up",
            Priority = Priority.High,
            Status = status,
            DueDate = DateTime.UtcNow.Date
        };
        provider.Patients.Add(patient);
        provider.Tasks.Add(task);
        return task;
    }

    [Fact]
    public async Task GetAll_Returns200_WithTaskList()
    {
        var (controller, provider) = CreateSut();
        AddTask(provider);

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_Returns200_WhenTaskExistsAndStatusValid()
    {
        var (controller, provider) = CreateSut();
        var task = AddTask(provider);

        var result = await controller.UpdateStatus(task.Id, new UpdateTaskDto("completed"));

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_Returns404_WhenTaskDoesNotExist()
    {
        var (controller, _) = CreateSut();

        var result = await controller.UpdateStatus(Guid.NewGuid(), new UpdateTaskDto("completed"));

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFound.StatusCode);
    }

    [Fact]
    public async Task UpdateStatus_Returns400_WhenStatusInvalid()
    {
        var (controller, provider) = CreateSut();
        var task = AddTask(provider);

        var result = await controller.UpdateStatus(task.Id, new UpdateTaskDto("bogus"));

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }
}

public class HealthControllerTests
{
    [Fact]
    public void Get_Returns200_WithHealthyStatus()
    {
        var controller = new HealthController();

        var result = controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
    }
}
