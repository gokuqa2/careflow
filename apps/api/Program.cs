using CareFlow.Api.Data;
using CareFlow.Api.Middleware;
using CareFlow.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "CareFlow API",
        Version = "v1",
        Description = "Care coordination platform API — interview demo"
    });
});

// Application Insights — connection string comes from env/appsettings
builder.Services.AddApplicationInsightsTelemetry();

// SQLite locally (no connection string), Azure SQL in production
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite("Data Source=careflow_dev.db"));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
}

builder.Services.AddScoped<ICareDataProvider, EfCoreCareDataProvider>();
builder.Services.AddScoped<CareService>();

// CORS — tighten in production
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Apply migrations and seed data on startup (safe for demo)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    DbSeeder.Seed(db);
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger enabled in all environments — demo project, no sensitive schema exposed
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();

app.Run();
