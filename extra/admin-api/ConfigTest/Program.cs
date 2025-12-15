using ConfigTest;
using Microsoft.EntityFrameworkCore;
using Spacebar.Db.Contexts;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();
builder.Services.AddDbContext<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
}, ServiceLifetime.Singleton);

var host = builder.Build();
host.Run();
