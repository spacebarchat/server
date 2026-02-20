using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminApi.Extensions;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/users")]
public class UserController(
    ILogger<UserController> logger,
    SpacebarAuthenticationConfiguration config,
    SpacebarDbContext db,
    IServiceProvider sp,
    SpacebarAspNetAuthenticationService auth,
    ISpacebarReplication replication
) : ControllerBase {
    /// <summary>
    /// Get all users
    /// </summary>
    /// <returns>List of user objects</returns>
    [HttpGet]
    public async IAsyncEnumerable<UserModel> Get() {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var results = db.Users
            .Include(user => user.ApplicationBotUser)
            .Include(user => user.MessageAuthors)
            .Include(user => user.Sessions)
            .Include(user => user.Templates)
            .Include(user => user.VoiceStates)
            .Include(user => user.Guilds)
            .AsAsyncEnumerable().Select(x => new UserModel {
                Id = x.Id,
                Username = x.Username,
                Discriminator = x.Discriminator,
                Avatar = x.Avatar,
                AccentColor = x.AccentColor,
                Banner = x.Banner,
                ThemeColors = x.ThemeColors,
                Pronouns = x.Pronouns,
                Phone = x.Phone,
                Desktop = x.Desktop,
                Mobile = x.Mobile,
                Premium = x.Premium,
                PremiumType = x.PremiumType,
                Bot = x.Bot,
                Bio = x.Bio,
                System = x.System,
                NsfwAllowed = x.NsfwAllowed,
                MfaEnabled = x.MfaEnabled,
                WebauthnEnabled = x.WebauthnEnabled,
                CreatedAt = x.CreatedAt,
                PremiumSince = x.PremiumSince,
                Verified = x.Verified,
                Disabled = x.Disabled,
                Deleted = x.Deleted,
                Email = x.Email,
                Flags = x.Flags,
                PublicFlags = x.PublicFlags,
                Rights = x.Rights,
                ApplicationBotUser = x.ApplicationBotUser == null ? null : new(),
                ConnectedAccounts = new List<UserModel.ConnectedAccountModel>(),
                MessageCount = x.MessageAuthors.Count, // This property is weirdly named due to scaffolding, might patch later
                SessionCount = x.Sessions.Count,
                TemplateCount = x.Templates.Count,
                VoiceStateCount = x.VoiceStates.Count,
                GuildCount = x.Guilds.Count,
                OwnedGuildCount = x.Guilds.Count(g => g.OwnerId == x.Id)
            });

        await foreach (var user in results) {
            yield return user;
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User object</returns>
    [HttpGet("{id}")]
    public async Task<UserModel> GetById(string id) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        return await db.Users
            .Include(user => user.ApplicationBotUser)
            .Include(user => user.MessageAuthors)
            .Include(user => user.Sessions)
            .Include(user => user.Templates)
            .Include(user => user.VoiceStates)
            .Include(user => user.Guilds)
            .Select(x => new UserModel {
                Id = x.Id,
                Username = x.Username,
                Discriminator = x.Discriminator,
                Avatar = x.Avatar,
                AccentColor = x.AccentColor,
                Banner = x.Banner,
                ThemeColors = x.ThemeColors,
                Pronouns = x.Pronouns,
                Phone = x.Phone,
                Desktop = x.Desktop,
                Mobile = x.Mobile,
                Premium = x.Premium,
                PremiumType = x.PremiumType,
                Bot = x.Bot,
                Bio = x.Bio,
                System = x.System,
                NsfwAllowed = x.NsfwAllowed,
                MfaEnabled = x.MfaEnabled,
                WebauthnEnabled = x.WebauthnEnabled,
                CreatedAt = x.CreatedAt,
                PremiumSince = x.PremiumSince,
                Verified = x.Verified,
                Disabled = x.Disabled,
                Deleted = x.Deleted,
                Email = x.Email,
                Flags = x.Flags,
                PublicFlags = x.PublicFlags,
                Rights = x.Rights,
                ApplicationBotUser = x.ApplicationBotUser == null ? null : new(),
                ConnectedAccounts = new List<UserModel.ConnectedAccountModel>(),
                MessageCount = x.MessageAuthors.Count, // This property is weirdly named due to scaffolding, might patch later
                SessionCount = x.Sessions.Count,
                TemplateCount = x.Templates.Count,
                VoiceStateCount = x.VoiceStates.Count,
                GuildCount = x.Guilds.Count,
                OwnedGuildCount = x.Guilds.Count(g => g.OwnerId == x.Id)
            })
            .SingleAsync(x => x.Id == id);
    }

    [HttpGet("{id}/delete")]
    public async IAsyncEnumerable<AsyncActionResult> DeleteUser(string id, [FromQuery] int messageDeleteChunkSize = 100) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var user = await db.Users.FindAsync(id);
        if (user == null) {
            Console.WriteLine($"User {id} not found");
            yield return new AsyncActionResult("ERROR", new { entity = "User", id, message = "User not found" });
            yield break;
        }

        user.Data = "{}";
        user.Deleted = true;
        user.Disabled = true;
        user.Rights = 0;
        db.Users.Update(user);
        await db.SaveChangesAsync();

        var messages = db.Messages
            .AsNoTracking()
            .Where(m => m.AuthorId == id);
        var channels = messages
            .Select(m => new { m.ChannelId, m.GuildId })
            .Distinct()
            .ToList();
        yield return new("STATS",
            new {
                total_messages = messages.Count(), total_channels = channels.Count,
                messages_per_channel = channels.ToDictionary(c => c.ChannelId, c => messages.Count(m => m.ChannelId == c.ChannelId))
            });
        if (messages.Any()) {
            var results = channels
                .Select(ctx => DeleteMessagesForChannel(ctx.GuildId, ctx.ChannelId!, id, messageDeleteChunkSize))
                .ToList();
            var a = AggregateAsyncEnumerablesWithoutOrder(results);
            await foreach (var result in a) {
                yield return result;
            }

            if (messages.Count() >= 100) {
                await db.Database.ExecuteSqlRawAsync("VACUUM FULL messages");
                await db.Database.ExecuteSqlRawAsync("REINDEX TABLE messages");
            }
        }
    }

    // [HttpGet("{id}/Dms")]
    // public async IEnumerable<object> GetDmsAsync(string userId) {
        // yield break; // TODO
    // }

    private async IAsyncEnumerable<AsyncActionResult> DeleteMessagesForChannel(
        // context
        string? guildId, string channelId, string authorId,
        // options
        int messageDeleteChunkSize = 100
    ) {
        {
            await using var ctx = sp.CreateAsyncScope();
            await using var _db = ctx.ServiceProvider.GetRequiredService<SpacebarDbContext>();
            var messagesInChannel = _db.Messages.AsNoTracking().Count(m => m.AuthorId == authorId && m.ChannelId == channelId && m.GuildId == guildId);
            var remaining = messagesInChannel;
            while (true) {
                var messageIds = _db.Database.SqlQuery<string>($"""
                                                                DELETE FROM messages
                                                                  WHERE id IN (
                                                                    SELECT id FROM messages
                                                                      WHERE author_id = {authorId}
                                                                        AND channel_id = {channelId}
                                                                        AND guild_id = {guildId}
                                                                     LIMIT {messageDeleteChunkSize}
                                                                  ) RETURNING id;
                                                                """).ToList();
                if (messageIds.Count == 0) {
                    break;
                }

                await replication.SendAsync(new() {
                    Event = "MESSAGE_BULK_DELETE",
                    ChannelId = channelId,
                    Payload = new {
                        channel_id = channelId,
                        guild_id = guildId,
                        ids = messageIds,
                    },
                    Origin = "AdminApi/DeleteMessagesForChannel"
                });

                yield return new("BULK_DELETED", new {
                    channel_id = channelId,
                    total = messagesInChannel,
                    deleted = messageIds.Count,
                    remaining = remaining -= messageIds.Count,
                });
                await Task.Yield();
            }
        }
    }

    private async IAsyncEnumerable<T> AggregateAsyncEnumerablesWithoutOrder<T>(params IEnumerable<IAsyncEnumerable<T>> enumerables) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var enumerators = enumerables.Select(e => e.GetAsyncEnumerator()).ToList();
        var tasks = enumerators.Select(e => e.MoveNextAsync().AsTask()).ToList();

        try {
            while (tasks.Count > 0) {
                var completedTask = await Task.WhenAny(tasks);
                var completedTaskIndex = tasks.IndexOf(completedTask);

                if (completedTask.IsCanceled) {
                    try {
                        await enumerators[completedTaskIndex].DisposeAsync();
                    }
                    catch {
                        // ignored
                    }

                    enumerators.RemoveAt(completedTaskIndex);
                    tasks.RemoveAt(completedTaskIndex);
                    continue;
                }

                if (await completedTask) {
                    var enumerator = enumerators[completedTaskIndex];
                    yield return enumerator.Current;
                    tasks[completedTaskIndex] = enumerator.MoveNextAsync().AsTask();
                }
                else {
                    try {
                        await enumerators[completedTaskIndex].DisposeAsync();
                    }
                    catch {
                        // ignored
                    }

                    enumerators.RemoveAt(completedTaskIndex);
                    tasks.RemoveAt(completedTaskIndex);
                }
            }
        }
        finally {
            foreach (var enumerator in enumerators) {
                try {
                    await enumerator.DisposeAsync();
                }
                catch {
                    // ignored
                }
            }
        }
    }
}