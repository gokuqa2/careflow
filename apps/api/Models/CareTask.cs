namespace CareFlow.Api.Models;

public class CareTask
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string Title { get; set; } = string.Empty;
    public Priority Priority { get; set; }
    public TaskStatus Status { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }

    public Patient Patient { get; set; } = null!;
}
