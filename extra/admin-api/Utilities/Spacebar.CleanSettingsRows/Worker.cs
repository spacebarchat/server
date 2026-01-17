using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.CleanSettingsRows;

public class Worker(ILogger<Worker> logger, IServiceProvider sp) : BackgroundService {
    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        logger.LogInformation("Starting settings row cleanup worker");

        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        List<Task> tasks = [];
        await foreach (var chunk in GetChunks(db, 1000, stoppingToken)) {
            tasks.Add(ProcessChunk(chunk, stoppingToken));
        }

        await Task.WhenAll(tasks);

        logger.LogInformation("Finished settings row cleanup worker");
    }

    private async IAsyncEnumerable<UserSetting[]> GetChunks(SpacebarDbContext db, int chunkSize, [EnumeratorCancellation] CancellationToken stoppingToken) {
        var total = await db.UserSettings.CountAsync(stoppingToken);
        for (var i = 0; i < total; i += chunkSize) {
            var chunk = await db.UserSettings
                .Include(x => x.User)
                .OrderBy(x => x.Index)
                .Skip(i)
                .Take(chunkSize)
                .ToArrayAsync(stoppingToken);
            yield return chunk;
        }
    }

    private async Task ProcessChunk(UserSetting[] chunk, CancellationToken stoppingToken) {
        if (chunk.Length == 0) return;
        logger.LogInformation("Processing chunk of {Count} settings rows starting at idx={}", chunk.Length, chunk[0].Index);
        var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        foreach (var setting in chunk) {
            if (stoppingToken.IsCancellationRequested) break;
            if (setting.User == null) {
                logger.LogInformation("Deleting orphaned settings row {Id}", setting.Index);
                db.UserSettings.Remove(setting);
            }
            else if (setting is {
                         // default settings
                         AfkTimeout: 3600,
                         AllowAccessibilityDetection: true,
                         AnimateEmoji: true,
                         AnimateStickers: 0,
                         ContactSyncEnabled: false,
                         ConvertEmoticons: false,
                         CustomStatus: null,
                         DefaultGuildsRestricted: false,
                         DetectPlatformAccounts: false,
                         DeveloperMode: true,
                         DisableGamesTab: true,
                         EnableTtsCommand: false,
                         ExplicitContentFilter: 0,
                         FriendSourceFlags: "{\"all\":true}",
                         GatewayConnected: false,
                         GifAutoPlay: false,
                         GuildFolders: "[]",
                         GuildPositions: "[]",
                         InlineAttachmentMedia: true,
                         InlineEmbedMedia: true,
                         MessageDisplayCompact: false,
                         NativePhoneIntegrationEnabled: true,
                         RenderEmbeds: true,
                         RenderReactions: true,
                         RestrictedGuilds: "[]",
                         ShowCurrentGame: true,
                         Status: "online",
                         StreamNotificationsEnabled: false,
                         Theme: "dark",
                         TimezoneOffset: 0,
                         FriendDiscoveryFlags: 0,
                         ViewNsfwGuilds: true,
                         // only different property:
                         //Locale: "en-US"
                     }) {
                logger.LogInformation("Deleting default settings row {Id} for user {UserId}", setting.Index, setting.User.Id);
                setting.User.SettingsIndex = null;
                db.UserSettings.Remove(setting);
            }
        }

        await db.SaveChangesAsync(stoppingToken);
    }
}