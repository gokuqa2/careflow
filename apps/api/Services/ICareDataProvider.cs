using CareFlow.Api.Models;

namespace CareFlow.Api.Services;

/// <summary>
/// Abstracts the care data source.
/// Current implementation: EF Core / Azure SQL.
/// Future implementation: EpicCareDataProvider (FHIR R4 via Epic SMART on FHIR).
/// </summary>
public interface ICareDataProvider
{
    Task<List<Patient>> GetPatientsAsync();
    Task<Patient?> GetPatientByIdAsync(Guid id);
    Task<List<CareTask>> GetCareTasksAsync();
    Task<CareTask?> GetCareTaskByIdAsync(Guid id);
    Task UpdateCareTaskAsync(CareTask task);
}
