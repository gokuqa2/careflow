namespace CareFlow.Api.DTOs;

public record CareTaskDto(
    Guid Id,
    Guid PatientId,
    string PatientName,
    string Title,
    string Priority,
    string Status,
    string DueDate,
    string? Notes
);

public record UpdateTaskDto(string Status);
