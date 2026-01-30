using System.Diagnostics;
using ArcaneLibs.Extensions;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Cdn.Signing;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.Cdn.Fsck;

public class FsckService(ILogger<FsckService> logger, IServiceScopeFactory serviceScopeFactory, MigrationFileStores stores, CdnSigningService sigService) : IHostedService {
    private SpacebarDbContext _db = null!;

    public async Task StartAsync(CancellationToken cancellationToken) {
        var sw = Stopwatch.StartNew();
        await using var scope = serviceScopeFactory.CreateAsyncScope();
        _db = scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        logger.LogInformation("Starting migrations from {source} to {dest}...", $"{stores.From.GetType().FullName}({stores.From.BaseUrl})",
            $"{stores.To.GetType().FullName}({stores.To.BaseUrl})");
        await RunFsckAsync("User Avatars", "/avatars", EnumerateUserAvatarFilesAsync(), cancellationToken);
        await RunFsckAsync("User Banners", "/banners", EnumerateUserBannerPathsAsync(), cancellationToken);
        await RunFsckAsync("Guild Icons", "/icons", EnumerateGuildIconPathsAsync(), cancellationToken);
        await RunFsckAsync("Stickers", "/stickers", EnumerateStickerPathsAsync(), cancellationToken);
        await RunFsckAsync("Emojis", "/emojis", EnumerateEmojiPathsAsync(), cancellationToken);

        // var atts = EnumerateAttachmentPathsAsync();
        // var refreshedAtts = new List<FsckItem>();
        // var attRefreshedTasks = atts.Chunk(40).Select(async x => {
        //     var req = 
        //     return new FsckItem[10];
        // });
        // await foreach (var attRefreshedChunk in attRefreshedTasks.ToAsyncResultEnumerable()) {
        //     refreshedAtts.AddRange(attRefreshedChunk);
        // }
        
        await RunFsckAsync("Attachments", "/attachments", EnumerateAttachmentPathsAsync(), cancellationToken);
        logger.LogInformation("Fsck complete in {time}.", sw.Elapsed);
    }

    public async Task StopAsync(CancellationToken cancellationToken) { }

    private readonly Stopwatch _lastUpdateSw = Stopwatch.StartNew();
    private readonly SemaphoreSlim _fsckSemaphore = new(32, 32);

    public struct FsckItem {
        public string Path;
        public string ItemId;
    }

    private async Task RunFsckAsync(string name, string path, IQueryable<FsckItem> items, CancellationToken? cancellationToken = null) {
        int i = 0, notFound = 0, alreadyLocal = 0, count = await items.CountAsync();
        List<Task> tasks = [];

        await foreach (var item in items.AsAsyncEnumerable()) {
            tasks.Add(Task.Run(async () => {
                try {
                    await _fsckSemaphore.WaitAsync();
                    if (cancellationToken?.IsCancellationRequested ?? false)
                        return;

                    if (await stores.To.FileExists(item.Path)) {
                        alreadyLocal++;
                        logger.LogInformation("TO: {itemType} {itemId} already exists at {path}, skipping.", name, item.ItemId, item.Path);
                    }
                    else if (!await stores.From.FileExists(item.Path)) {
                        notFound++;
                        logger.LogWarning("FROM: {itemType} {itemId} is missing at {path}", name, item.ItemId, stores.From.BaseUrl + item.Path);
                    }
                    else {
                        // logger.LogInformation("Migrating {itemType} {itemId} at {path}", name, item.ItemId, item.Path);
                        await using var f = await stores.From.GetFile(item.Path);
                        // logger.LogInformation("Got file {itemType} {itemId} at {path}, writing to destination...", name, item.ItemId, item.Path);
                        await stores.To.WriteFile(item.Path, f.Stream);
                    }

                    if (true || _lastUpdateSw.ElapsedMilliseconds >= 1000 / 30 || i == 0) {
                        _lastUpdateSw.Restart();
                        Console.Write($"{name} download: {i}/{count}: {item.Path,-64}\r");
                    }

                    i++;
                }
                catch (Exception ex) {
                    logger.LogError(ex, "Error processing {itemType} {itemId} at {path}: {message}", name, item.ItemId, item.Path, ex.Message);
                }
                finally {
                    _fsckSemaphore.Release();
                }
            }));
        }

        await Task.WhenAll(tasks);
        logger.LogInformation("Validated {count} items for {path}: {alreadyLocal} already local, {notFound} not found", i, path, alreadyLocal, notFound);
    }

#region User Assets

    public IQueryable<FsckItem> EnumerateUserAvatarFilesAsync() =>
        _db.Users
            .Where(x => !string.IsNullOrWhiteSpace(x.Avatar))
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/avatars/{x.Id}/{x.Avatar}",
                ItemId = x.Id
            });

    public IQueryable<FsckItem> EnumerateUserBannerPathsAsync() =>
        _db.Users
            .Where(x => !string.IsNullOrWhiteSpace(x.Banner))
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/banners/{x.Id}/{x.Banner}",
                ItemId = x.Id
            });

#endregion

#region Guild Assets

    public IQueryable<FsckItem> EnumerateGuildIconPathsAsync() =>
        _db.Guilds
            .Where(x => !string.IsNullOrWhiteSpace(x.Icon))
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/icons/{x.Id}/{x.Icon}",
                ItemId = x.Id
            });

    public IQueryable<FsckItem> EnumerateRoleIconPathsAsync() =>
        _db.Roles
            .Where(x => !string.IsNullOrWhiteSpace(x.Icon))
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/role-icons/{x.Id}/{x.Icon}",
                ItemId = x.Id
            });

    public IQueryable<FsckItem> EnumerateStickerPathsAsync() =>
        _db.Stickers
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/stickers/{x.Id}.png",
                ItemId = x.Id
            });

    public IQueryable<FsckItem> EnumerateEmojiPathsAsync() =>
        _db.Emojis
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/emojis/{x.Id}",
                ItemId = x.Id
            });

#endregion

#region Application Assets

    public IQueryable<FsckItem> EnumerateApplicationIconPathsAsync() =>
        _db.Applications
            .Where(x => !string.IsNullOrWhiteSpace(x.Icon))
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/app-icons/{x.Id}/{x.Icon}",
                ItemId = x.Id
            });

    public IQueryable<FsckItem> EnumerateApplicationCoverPathsAsync() =>
        _db.Applications
            .Where(x => !string.IsNullOrWhiteSpace(x.Icon))
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/app-icons/{x.Id}/{x.CoverImage}",
                ItemId = x.Id
            });

    // TODO: not implemented?
    // public IQueryable<FsckItem> EnumerateApplicationSplashPathsAsync() =>
    //     _db.Applications
    //         .Where(x => !string.IsNullOrWhiteSpace(x.Icon))
    //         .OrderBy(x => x.Id)
    //         .Select(x => new FsckItem {
    //             Path = $"/app-icons/{x.Id}/{x.OwnerId}", // TODO - no db property for splash?
    //             ItemId = x.Id
    //         });
    //
    // public IQueryable<FsckItem> EnumerateApplicationAssets() =>
    //     _db.Applications
    //         .Where(x => !string.IsNullOrWhiteSpace(x.Icon))
    //         .OrderBy(x => x.Id)
    //         .Select(x => new FsckItem {
    //             Path = $"/app-icons/{x.Id}/{x.Icon}",
    //             ItemId = x.Id
    //         });

#endregion

#region Attachments

    public IQueryable<FsckItem> EnumerateAttachmentPathsAsync() =>
        _db.Attachments
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = sigService.Sign(new() {
                    Path = $"/attachments/{x.Message!.ChannelId}/{x.Id}/{x.Filename}",
                    IpAddress = "109.128.185.4"
                }).GetSignedPath(),
                // Path = $"/attachments/{x.Message!.ChannelId}/{x.Id}/{x.Filename}",
                ItemId = x.Id
            });

#endregion
}