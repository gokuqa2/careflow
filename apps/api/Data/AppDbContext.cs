using CareFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFlow.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<CareTask> CareTasks => Set<CareTask>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Patient>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).IsRequired().HasMaxLength(200);
            e.Property(p => p.AssignedProvider).IsRequired().HasMaxLength(200);
            e.Property(p => p.DateOfBirth).IsRequired().HasMaxLength(20);
            e.Property(p => p.Priority).HasConversion<string>();
        });

        modelBuilder.Entity<CareTask>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Title).IsRequired().HasMaxLength(500);
            e.Property(t => t.Priority).HasConversion<string>();
            e.Property(t => t.Status).HasConversion<string>();
            e.Property(t => t.Notes).HasMaxLength(1000);
            e.HasOne(t => t.Patient)
             .WithMany(p => p.Tasks)
             .HasForeignKey(t => t.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
