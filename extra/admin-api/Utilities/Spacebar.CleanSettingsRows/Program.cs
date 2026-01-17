using Microsoft.EntityFrameworkCore;
using Spacebar.CleanSettingsRows;
using Spacebar.Models.Db.Contexts;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();

builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});


var host = builder.Build();
host.Run();