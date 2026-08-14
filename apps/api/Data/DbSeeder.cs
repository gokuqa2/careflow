using CareFlow.Api.Models;

namespace CareFlow.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Patients.Any()) return;

        var today = DateTime.UtcNow.Date;

        var johnDoe = new Patient
        {
            Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001"),
            Name = "John Doe",
            DateOfBirth = "1978-03-15",
            Priority = Priority.High,
            AssignedProvider = "Dr. Sarah Miller"
        };

        var janeSmith = new Patient
        {
            Id = Guid.Parse("a1b2c3d4-0002-0002-0002-000000000002"),
            Name = "Jane Smith",
            DateOfBirth = "1985-07-22",
            Priority = Priority.Medium,
            AssignedProvider = "Dr. Kevin Ortiz"
        };

        var robertChen = new Patient
        {
            Id = Guid.Parse("a1b2c3d4-0003-0003-0003-000000000003"),
            Name = "Robert Chen",
            DateOfBirth = "1962-11-08",
            Priority = Priority.High,
            AssignedProvider = "Dr. Sarah Miller"
        };

        var mariaLopez = new Patient
        {
            Id = Guid.Parse("a1b2c3d4-0004-0004-0004-000000000004"),
            Name = "Maria Lopez",
            DateOfBirth = "1990-05-30",
            Priority = Priority.Low,
            AssignedProvider = "Dr. Kevin Ortiz"
        };

        db.Patients.AddRange(johnDoe, janeSmith, robertChen, mariaLopez);

        db.CareTasks.AddRange(
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = johnDoe.Id,
                Title = "Follow up with patient",
                Priority = Priority.High,
                Status = Models.TaskStatus.Pending,
                DueDate = today,
                Notes = "Patient reported increased discomfort during last visit."
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = johnDoe.Id,
                Title = "Review lab results",
                Priority = Priority.High,
                Status = Models.TaskStatus.Pending,
                DueDate = today,
                Notes = "CBC and metabolic panel ordered last week."
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = johnDoe.Id,
                Title = "Schedule specialist referral",
                Priority = Priority.Medium,
                Status = Models.TaskStatus.Pending,
                DueDate = today.AddDays(3),
                Notes = "Cardiology consult requested."
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = janeSmith.Id,
                Title = "Review care plan",
                Priority = Priority.Medium,
                Status = Models.TaskStatus.Pending,
                DueDate = today.AddDays(1),
                Notes = "Quarterly care plan review."
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = janeSmith.Id,
                Title = "Medication reconciliation",
                Priority = Priority.Medium,
                Status = Models.TaskStatus.Completed,
                DueDate = today.AddDays(-1),
                Notes = "Completed during last visit."
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = robertChen.Id,
                Title = "Post-discharge assessment",
                Priority = Priority.High,
                Status = Models.TaskStatus.Pending,
                DueDate = today,
                Notes = "Patient discharged 48 hours ago."
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = robertChen.Id,
                Title = "Update emergency contact",
                Priority = Priority.Low,
                Status = Models.TaskStatus.Pending,
                DueDate = today.AddDays(5),
                Notes = null
            },
            new CareTask
            {
                Id = Guid.NewGuid(),
                PatientId = mariaLopez.Id,
                Title = "Annual wellness check",
                Priority = Priority.Low,
                Status = Models.TaskStatus.Pending,
                DueDate = today.AddDays(7),
                Notes = null
            }
        );

        db.SaveChanges();
    }
}
