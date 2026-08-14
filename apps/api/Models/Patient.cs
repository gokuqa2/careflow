namespace CareFlow.Api.Models;

public class Patient
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public Priority Priority { get; set; }
    public string AssignedProvider { get; set; } = string.Empty;

    public ICollection<CareTask> Tasks { get; set; } = new List<CareTask>();
}
