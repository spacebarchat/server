using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.AdminApi.Services;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;
using Spacebar.RabbitMqUtilities;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/Guilds")]
public class GuildController(ILogger<GuildController> logger, Configuration config, RabbitMQConfiguration amqpConfig, SpacebarDbContext db, RabbitMQService mq, IServiceProvider sp, AuthenticationService auth) : ControllerBase {
    private readonly ILogger<GuildController> _logger = logger;

    [HttpGet]
    public async IAsyncEnumerable<GuildModel> Get() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var results = db.Guilds.Select(x => new GuildModel {
            Id = x.Id,
            AfkChannelId = x.AfkChannelId,
            AfkTimeout = x.AfkTimeout,
            Banner = x.Banner,
            DefaultMessageNotifications = x.DefaultMessageNotifications,
            Description = x.Description,
            DiscoverySplash = x.DiscoverySplash,
            ExplicitContentFilter = x.ExplicitContentFilter,
            Features = x.Features,
            PrimaryCategoryId = x.PrimaryCategoryId,
            Icon = x.Icon,
            Large = x.Large,
            MaxMembers = x.MaxMembers,
            MaxPresences = x.MaxPresences,
            MaxVideoChannelUsers = x.MaxVideoChannelUsers,
            MemberCount = x.MemberCount,
            PresenceCount = x.PresenceCount,
            TemplateId = x.TemplateId,
            MfaLevel = x.MfaLevel,
            Name = x.Name,
            OwnerId = x.OwnerId,
            PreferredLocale = x.PreferredLocale,
            PremiumSubscriptionCount = x.PremiumSubscriptionCount,
            PremiumTier = x.PremiumTier,
            PublicUpdatesChannelId = x.PublicUpdatesChannelId,
            RulesChannelId = x.RulesChannelId,
            Region = x.Region,
            Splash = x.Splash,
            SystemChannelId = x.SystemChannelId,
            SystemChannelFlags = x.SystemChannelFlags,
            Unavailable = x.Unavailable,
            VerificationLevel = x.VerificationLevel,
            WelcomeScreen = x.WelcomeScreen,
            WidgetChannelId = x.WidgetChannelId,
            WidgetEnabled = x.WidgetEnabled,
            NsfwLevel = x.NsfwLevel,
            Nsfw = x.Nsfw,
            Parent = x.Parent,
            PremiumProgressBarEnabled = x.PremiumProgressBarEnabled,
            ChannelOrdering = x.ChannelOrdering,
            ChannelCount = x.Channels.Count(),
            RoleCount = x.Roles.Count(),
            EmojiCount = x.Emojis.Count(),
            StickerCount = x.Stickers.Count(),
            InviteCount = x.Invites.Count(),
            MessageCount = x.Messages.Count(),
            BanCount = x.Bans.Count(),
            VoiceStateCount = x.VoiceStates.Count(),
        }).AsAsyncEnumerable();
        await foreach (var result in results) {
            yield return result;
        }
    }
    
    [HttpPost("{id}/force_join")]
    public async Task<IActionResult> ForceJoinGuild([FromBody] ForceJoinRequest request, string id) {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var guild = await db.Guilds.FindAsync(id);
        if (guild == null) {
            return NotFound(new { entity = "Guild", id, message = "Guild not found" });
        }
        
        var userId = request.UserId ?? config.OverrideUid ?? (await auth.GetCurrentUser(Request)).Id;
        var user = await db.Users.FindAsync(userId);
        if (user == null) {
            return NotFound(new { entity = "User", id = userId, message = "User not found" });
        }
        
        var member = await db.Members.SingleOrDefaultAsync(m => m.GuildId == id && m.Id == userId);
        if (member is null) {
            member = new Member {
                Id = userId,
                GuildId = id,
                JoinedAt = DateTime.UtcNow,
                PremiumSince = 0,
                Roles = [await db.Roles.SingleAsync(r => r.Id == id)],
                Pending = false
            };
            await db.Members.AddAsync(member);
            guild.MemberCount++;
            db.Guilds.Update(guild);
            await db.SaveChangesAsync();
        }
        
        if (request.MakeOwner) {
            guild.OwnerId = userId;
            db.Guilds.Update(guild);
            await db.SaveChangesAsync();
        } else if (request.MakeAdmin) {
            var roles = await db.Roles.Where(r => r.GuildId == id).OrderBy(x=>x.Position).ToListAsync();
            var adminRole = roles.FirstOrDefault(r => r.Permissions == "8" || r.Permissions == "9"); // Administrator
            if (adminRole == null) {
                adminRole = new Role {
                    Id = Guid.NewGuid().ToString(),
                    GuildId = id,
                    Name = "Instance administrator",
                    Color = 0,
                    Hoist = false,
                    Position = roles.Max(x=>x.Position) + 1,
                    Permissions = "8", // Administrator
                    Managed = false,
                    Mentionable = false
                };
                await db.Roles.AddAsync(adminRole);
                await db.SaveChangesAsync();
            }

            if (!member.Roles.Any(r => r.Id == adminRole.Id)) {
                member.Roles.Add(adminRole);
                db.Members.Update(member);
                await db.SaveChangesAsync();
            }
        }
        
        // TODO: gateway events
        
        return Ok(new { entity = "Guild", id, message = "Guild join forced" });
    }

    [HttpGet("{id}/delete")]
    public async IAsyncEnumerable<AsyncActionResult> DeleteUser(string id, [FromQuery] int messageDeleteChunkSize = 100) {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
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

        var factory = new ConnectionFactory {
            Uri = new Uri("amqp://guest:guest@127.0.0.1/")
        };
        await using var mqConnection = await factory.CreateConnectionAsync();
        await using var mqChannel = await mqConnection.CreateChannelAsync();

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
        var results = channels
            .Select(ctx => DeleteMessagesForChannel(ctx.GuildId, ctx.ChannelId!, id, mqChannel, messageDeleteChunkSize))
            .ToList();
        var a = AggregateAsyncEnumerablesWithoutOrder(results);
        await foreach (var result in a) {
            yield return result;
        }

        await db.Database.ExecuteSqlRawAsync("VACUUM FULL messages");
        await db.Database.ExecuteSqlRawAsync("REINDEX TABLE messages");
    }

    private async IAsyncEnumerable<AsyncActionResult> DeleteMessagesForChannel(
        // context
        string? guildId, string channelId, string authorId,
        // connections
        IChannel mqChannel,
        // options
        int messageDeleteChunkSize = 100
    ) {
        {
            await using var ctx = sp.CreateAsyncScope();
            await using var _db = ctx.ServiceProvider.GetRequiredService<SpacebarDbContext>();
            await mqChannel.ExchangeDeclareAsync(exchange: channelId!, type: ExchangeType.Fanout, durable: false);
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

                var props = new BasicProperties() { Type = "MESSAGE_BULK_DELETE" };
                var publishSuccess = false;
                do {
                    try {
                        await mqChannel.BasicPublishAsync(exchange: channelId!, routingKey: "", mandatory: true, basicProperties: props, body: new {
                            ids = messageIds,
                            channel_id = channelId,
                            guild_id = guildId,
                        }.ToJson().AsBytes().ToArray());
                        publishSuccess = true;
                    }
                    catch (Exception e) {
                        Console.WriteLine($"[RabbitMQ] Error publishing bulk delete: {e.Message}");
                        await Task.Delay(10);
                    }
                } while (!publishSuccess);

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
    
    // {
        // "op": 0,
        // "t": "GUILD_ROLE_UPDATE",
        // "d": {
            // "guild_id": "1006649183970562092",
            // "role": {
                // "id": "1006706520514028812",
                // "guild_id": "1006649183970562092",
                // "color": 16711680,
                // "hoist": true,
                // "managed": false,
                // "mentionable": true,
                // "name": "Adminstrator",
                // "permissions": "9",
                // "position": 5,
                // "unicode_emoji": "💖",
                // "flags": 0
            // }
        // },
        // "s": 38
    // }
    
}