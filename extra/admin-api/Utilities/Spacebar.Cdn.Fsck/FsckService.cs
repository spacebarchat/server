using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Cdn.Abstractions;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.Cdn.Fsck;

public class FsckService(ILogger<FsckService> logger, IServiceScopeFactory serviceScopeFactory, IFileSource fs) : IHostedService {
    private SpacebarDbContext _db = null!;

    public async Task StartAsync(CancellationToken cancellationToken) {
        var sw = Stopwatch.StartNew();
        await using var scope = serviceScopeFactory.CreateAsyncScope();
        _db = scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        logger.LogInformation("Starting fsck on {source}...", $"{fs.GetType().FullName}({fs.BaseUrl})");
        await RunFsckAsync("User Avatars", "/avatars", EnumerateUserAvatarFilesAsync());
        await RunFsckAsync("User Banners", "/banners", EnumerateUserBannerPathsAsync());
        await RunFsckAsync("Guild Icons", "/icons", EnumerateGuildIconPathsAsync());
        await RunFsckAsync("Stickers", "/stickers", EnumerateStickerPathsAsync());
        await RunFsckAsync("Emojis", "/emojis", EnumerateEmojiPathsAsync());
        logger.LogInformation("Fsck complete in {time}.", sw.Elapsed);
    }

    public async Task StopAsync(CancellationToken cancellationToken) { }

    private readonly Stopwatch _lastUpdateSw = Stopwatch.StartNew();
    private readonly SemaphoreSlim _fsckSemaphore = new SemaphoreSlim(32, 32);

    public struct FsckItem {
        public string Path;
        public string ItemId;
        public bool IsSingleSubDirFile;
    }

    private async Task RunFsckAsync(string name, string path, IQueryable<FsckItem> items) {
        int i = 0, count = await items.CountAsync();
        List<Task> tasks = [];

        await foreach (var item in items.AsAsyncEnumerable()) {
            tasks.Add(Task.Run(async () => {
                await _fsckSemaphore.WaitAsync();
                if (_lastUpdateSw.ElapsedMilliseconds >= (1000 / 30) || i == 0) {
                    _lastUpdateSw.Restart();
                    Console.Write($"{name} fsck: {i}/{count}: {item.Path,-64}\r");
                }

                i++;
                if (!item.IsSingleSubDirFile) {
                    if (!await fs.FileExists(item.Path))
                        logger.LogWarning("{itemType} {itemId} is missing at {path}", name, item.ItemId, item.Path);
                }
                else if (item.IsSingleSubDirFile && fs is FilesystemFileSource ffs) {
                    if(!await ffs.DirectoryExists(Path.GetDirectoryName(item.Path)))
                        logger.LogWarning("{itemType} {itemId} is missing at {path} (directory missing)", name, item.ItemId, item.Path);
                }
                else {
                    logger.LogWarning("Unhandled case: {itemType} {itemId} -> {path} (IsSingleSubDirFile: {isSingleSubDirFile}, fstype: {fsType})", name, item.ItemId, item.Path, item.IsSingleSubDirFile, fs.GetType().Name);
                }

                _fsckSemaphore.Release();
            }));
        }

        await Task.WhenAll(tasks);
        logger.LogInformation("Validated {count} items for {path}.", i, path);
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
                Path = $"/stickers/{x.Id}",
                ItemId = x.Id,
                IsSingleSubDirFile = fs is FilesystemFileSource
            });

    public IQueryable<FsckItem> EnumerateEmojiPathsAsync() =>
        _db.Emojis
            .OrderBy(x => x.Id)
            .Select(x => new FsckItem {
                Path = $"/emojis/{x.Id}/",
                ItemId = x.Id,
                IsSingleSubDirFile = fs is FilesystemFileSource
            });

#endregion
}