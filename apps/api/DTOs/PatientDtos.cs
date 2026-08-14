namespace CareFlow.Api.DTOs;

public record PatientDto(
    Guid Id,
    string Name,
    string Priority,
    string AssignedProvider
);

public record PatientDetailDto(
    Guid Id,
    string Name,
    string DateOfBirth,
    string Priority,
    string AssignedProvider,
    List<CareTaskDto> Tasks
);
