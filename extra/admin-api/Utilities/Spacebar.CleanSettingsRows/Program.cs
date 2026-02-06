using Microsoft.EntityFrameworkCore;
using Spacebar.CleanSettingsRows;
using Spacebar.Models.Db.Contexts;

var builder = Host.CreateApplicationBuilder(args);
if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("APPSETTINGS_PATH")))
    builder.Configuration.AddJsonFile(Environment.GetEnvironmentVariable("APPSETTINGS_PATH")!);

builder.Services.AddHostedService<Worker>();

builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});

var host = builder.Build();
host.Run();