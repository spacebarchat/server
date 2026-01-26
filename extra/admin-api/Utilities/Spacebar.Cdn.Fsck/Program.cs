using ArcaneLibs;
using Microsoft.EntityFrameworkCore;
using Spacebar.Cdn.Fsck;
using Spacebar.Interop.Cdn.Abstractions;
using Spacebar.Models.Db.Contexts;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton<IFileSource>(new ProxyFileSource("http://cdn.old.server.spacebar.chat"));
builder.Services.AddSingleton<LruFileCache>(new LruFileCache(1*1024*1024*1024));
builder.Services.AddHostedService<FsckService>();

builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});

StreamingHttpClient.LogRequests = false;

var host = builder.Build();
host.Start();