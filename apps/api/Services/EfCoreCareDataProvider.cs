using CareFlow.Api.Data;
using CareFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareFlow.Api.Services;

public class EfCoreCareDataProvider(AppDbContext db) : ICareDataProvider
{
    public Task<List<Patient>> GetPatientsAsync() =>
        db.Patients.OrderBy(p => p.Name).ToListAsync();

    public Task<Patient?> GetPatientByIdAsync(Guid id) =>
        db.Patients.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == id);

    public Task<List<CareTask>> GetCareTasksAsync() =>
        db.CareTasks.Include(t => t.Patient).OrderBy(t => t.DueDate).ToListAsync();

    public Task<CareTask?> GetCareTaskByIdAsync(Guid id) =>
        db.CareTasks.Include(t => t.Patient).FirstOrDefaultAsync(t => t.Id == id);

    public async Task UpdateCareTaskAsync(CareTask task)
    {
        db.CareTasks.Update(task);
        await db.SaveChangesAsync();
    }
}
