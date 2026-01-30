using System.Buffers.Text;
using ArcaneLibs;
using Microsoft.EntityFrameworkCore;
using Spacebar.Cdn.Fsck;
using Spacebar.Interop.Cdn.Abstractions;
using Spacebar.Interop.Cdn.Signing;
using Spacebar.Models.Db.Contexts;

var builder = Host.CreateApplicationBuilder(args);
// builder.Services.AddSingleton<IFileSource>(new ProxyFileSource("http://cdn.old.server.spacebar.chat"));
IFileSource fromSrc, toSrc;

if (args.Length != 2) {
    Console.WriteLine("Usage: Spacebar.Cdn.Migration <from-path> <to-path>");
    return;
}

if (args[0].StartsWith("http://"))
    fromSrc = new ProxyFileSource(args[0]);
else
    fromSrc = new FilesystemFileSource(args[0]);

if (args[1].StartsWith("http://"))
    toSrc = new ProxyFileSource(args[1]);
else
    toSrc = new FilesystemFileSource(args[1]);

builder.Services.AddSingleton(new MigrationFileStores() {
    From = fromSrc,
    To = toSrc
});

builder.Services.AddSingleton<CdnSigningService>(sp =>
    new CdnSigningService(
        sp.GetRequiredService<ILogger<CdnSigningService>>(),
        Convert.FromBase64String(""),
        false,
        true,
        TimeSpan.FromMinutes(5)
    )
);
builder.Services.AddHostedService<FsckService>();

builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});

StreamingHttpClient.LogRequests = false;

var host = builder.Build();

await host.Services.GetRequiredService<MigrationFileStores>().From.Init();
await host.Services.GetRequiredService<MigrationFileStores>().To.Init();

host.Start();