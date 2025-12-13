using System.Diagnostics;
using ArcaneLibs;
using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using Spacebar.AdminAPI.Extensions;
using Spacebar.AdminApi.Models;
using Spacebar.AdminAPI.Services;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;
using Spacebar.RabbitMqUtilities;

namespace Spacebar.AdminAPI.Controllers;

[ApiController]
[Route("/users")]
public class UserController(ILogger<UserController> logger, Configuration config, RabbitMQConfiguration amqpConfig, SpacebarDbContext db, RabbitMQService mq, IServiceProvider sp, AuthenticationService auth) : ControllerBase {
    private readonly ILogger<UserController> _logger = logger;

    [HttpGet]
    public async IAsyncEnumerable<UserModel> Get() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var results = db.Users.Select(x => new UserModel {
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
        }).AsAsyncEnumerable();
        
        await foreach (var user in results) {
            yield return user;
        }
    }

    [HttpGet("meow")]
    public async Task Meow() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        Console.WriteLine("meow");

        ConnectionFactory factory = new ConnectionFactory();
        factory.Uri = new Uri("amqp://guest:guest@127.0.0.1/");
        using var connection = await factory.CreateConnectionAsync();
        using var channel = await connection.CreateChannelAsync();

        // await using var channel = mq.CreateChannel();
        // var channel2 = await channel.CreateChannelAsync();

        var body =
            $$"""
                  {
                    "id": "{{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}}",
                    "channel_id": "1322343566206308390",
                    "guild_id": "1322343566084673571",
                    "author": {
                      "username": "test",
                      "discriminator": "9177",
                      "id": "1322329228934500382",
                      "public_flags": 0,
                      "avatar": null,
                      "accent_color": null,
                      "banner": null,
                      "bio": "",
                      "bot": false,
                      "premium_since": "2024-12-27T22:24:15.867Z",
                      "premium_type": 2,
                      "theme_colors": null,
                      "pronouns": null,
                      "badge_ids": null
                    },
                    "member": {
                      "index": 2,
                      "id": "1322329228934500382",
                      "guild_id": "1322343566084673571",
                      "nick": null,
                      "joined_at": "2024-12-27T23:21:14.396Z",
                      "premium_since": null,
                      "deaf": false,
                      "mute": false,
                      "pending": false,
                      "last_message_id": "1322346635635753061",
                      "joined_by": null,
                      "avatar": null,
                      "banner": null,
                      "bio": "",
                      "theme_colors": null,
                      "pronouns": null,
                      "communication_disabled_until": null,
                      "roles": []
                    },
                    "content": "{{Random.Shared.NextInt64()}}",
                    "timestamp": "{{DateTime.UtcNow:O}}",
                    "edited_timestamp": null,
                    "tts": false,
                    "mention_everyone": false,
                    "mentions": [],
                    "mention_roles": [],
                    "attachments": [],
                    "embeds": [],
                    "reactions": [],
                    "nonce": "{{Random.Shared.NextInt64()}}",
                    "pinned": false,
                    "type": 0
                  }
                  """
                .AsBytes().ToArray();

        await channel.ExchangeDeclareAsync(exchange: "1322343566206308390", type: ExchangeType.Fanout, durable: false);
        var props = new BasicProperties() { Type = "MESSAGE_CREATE" };
        await channel.BasicPublishAsync(exchange: "1322343566206308390", routingKey: "", mandatory: true, basicProperties: props, body: body);

        await channel.CloseAsync();
        await connection.CloseAsync();
        Console.WriteLine("meowww");
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
        if (messages.Any()) {
            var results = channels
                .Select(ctx => DeleteMessagesForChannel(ctx.GuildId, ctx.ChannelId!, id, mqChannel, messageDeleteChunkSize))
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

    [HttpGet("duplicate")]
    public async Task<IActionResult> Duplicate() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var msg = db.Messages.First();
        var channels = db.Channels.Select(x => new { x.Id, x.GuildId }).ToList();
        int count = 1;
        while (true) {
            foreach (var channel in channels) {
                var newMsg = new Message {
                    Id = $"{Random.Shared.NextInt64()}",
                    ChannelId = channel.Id,
                    GuildId = channel.GuildId,
                    AuthorId = msg.AuthorId,
                    Content = msg.Content,
                    MemberId = msg.MemberId,
                    Timestamp = msg.Timestamp,
                    EditedTimestamp = msg.EditedTimestamp,
                    Tts = msg.Tts,
                    MentionEveryone = msg.MentionEveryone,
                    Attachments = msg.Attachments,
                    Embeds = msg.Embeds,
                    Reactions = msg.Reactions,
                    Nonce = msg.Nonce,
                    PinnedAt = msg.PinnedAt,
                    Type = msg.Type,
                };
                db.Messages.Add(newMsg);
                count++;
            }

            if (count % 100 == 0) {
                await db.SaveChangesAsync();
                await db.Database.ExecuteSqlRawAsync("VACUUM FULL messages");
            }

            if (count >= 100_000) {
                await db.SaveChangesAsync();
                await db.Database.ExecuteSqlRawAsync("VACUUM FULL messages");
                await db.Database.ExecuteSqlRawAsync("REINDEX TABLE messages");
                return Ok();
            }
        }
    }

    [HttpGet("duplicate/{id}")]
    public async Task<IActionResult> DuplicateMessage(ulong id, [FromQuery] int count = 100) {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var msg = await db.Messages.FindAsync(id.ToString());
        int createdCount = 1;
        while (true) {
            var newMsg = new Message {
                Id = $"{Random.Shared.NextInt64()}",
                ChannelId = msg.ChannelId,
                GuildId = msg.GuildId,
                AuthorId = msg.AuthorId,
                Content = msg.Content,
                MemberId = msg.MemberId,
                Timestamp = msg.Timestamp,
                EditedTimestamp = msg.EditedTimestamp,
                Tts = msg.Tts,
                MentionEveryone = msg.MentionEveryone,
                Attachments = msg.Attachments,
                Embeds = msg.Embeds,
                Reactions = msg.Reactions,
                Nonce = msg.Nonce,
                PinnedAt = msg.PinnedAt,
                Type = msg.Type,
            };
            db.Messages.Add(newMsg);
            createdCount++;

            if (createdCount % 100 == 0) {
                await db.SaveChangesAsync();
            }

            if (createdCount >= count) {
                await db.SaveChangesAsync();
                await db.Database.ExecuteSqlRawAsync("VACUUM FULL messages");
                await db.Database.ExecuteSqlRawAsync("REINDEX TABLE messages");
                return Ok();
            }
        }

        await db.SaveChangesAsync();
        await db.Database.ExecuteSqlRawAsync("VACUUM FULL messages");

        return Ok();
    }

    [HttpGet("truncate_messages")]
    public async Task TruncateMessages() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var channels = db.Channels.Select(x => new { x.Id, x.GuildId }).ToList();

        var ss = new SemaphoreSlim(12, 12);

        async Task TruncateChannelMessages(string channelId, string guildId) {
            await ss.WaitAsync();
            var tasks = Enumerable.Range(0, 99).Select(i => Task.Run(async () => {
                await using var scope = sp.CreateAsyncScope();
                await using var _db = scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
                // set timeout
                _db.Database.SetCommandTimeout(6000);
                await _db.Database.ExecuteSqlAsync($"""
                                                       DELETE FROM messages
                                                         WHERE channel_id = '{channelId}'
                                                           AND guild_id = '{guildId}'
                                                           AND id LIKE '%{i:00}';
                                                       """);

                Console.WriteLine($"Truncated messages for {channelId} in {guildId} ending with {i}");
            })).ToList();
            await Task.WhenAll(tasks);
            ss.Release();
        }

        var tasks = channels.Select(c => TruncateChannelMessages(c.Id, c.GuildId)).ToList();
        await Task.WhenAll(tasks);
    }

    private async IAsyncEnumerable<T> AggregateAsyncEnumerablesWithoutOrder<T>(params IEnumerable<IAsyncEnumerable<T>> enumerables) {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
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

    [HttpGet("test")]
    public async IAsyncEnumerable<string> Test() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
        var factory = new ConnectionFactory {
            Uri = new Uri(amqpConfig.ToConnectionString())
        };
        await using var mqConnection = await factory.CreateConnectionAsync();
        await using var mqChannel = await mqConnection.CreateChannelAsync();

        var guildId = "1006649183970562092";
        // var roleId = "1006706520514028812"; //Administrator
        var roleId = "1391303296148639051"; //Spacebar Maintainer
        // int color = 16711680; //Administrator
        int color = 99839; //Spacebar Maintainer

        await mqChannel.ExchangeDeclareAsync(exchange: guildId, type: ExchangeType.Fanout, durable: false);

        var props = new BasicProperties() { Type = "GUILD_ROLE_UPDATE" };
        int framerate = 30;
        float delay = 1000f / framerate;
        var secondsPerRotation = 6.243f;
        // use delay, 255f = one rotation, lengthFactor = iterations to make a full rotation
        var lengthFactor = (secondsPerRotation * 1000f / delay);
        Console.WriteLine("Length factor: {0}, RPS: {1}", lengthFactor, 0);
        var re = new RainbowEnumerator(lengthFactor: lengthFactor, offset: color, skip: 1);
        var sw = Stopwatch.StartNew();
        while (true) {
            var clr = re.Next();
            color = clr.r << 16 | clr.g << 8 | clr.b;
            var publishSuccess = false;
            do {
                try {
                    await mqChannel.BasicPublishAsync(exchange: guildId, routingKey: "", mandatory: false, basicProperties: props, body: new {
                        guild_id = guildId,
                        role = new {
                            id = roleId,
                            guild_id = guildId,
                            color,
                            hoist = false,
                            managed = false,
                            mentionable = true,
                            name = "Spacebar Maintainer",
                            permissions = "8",
                            position = 5,
                            unicode_emoji = "",
                            flags = 0
                        }
                    }.ToJson().AsBytes().ToArray());
                    publishSuccess = true;
                }
                catch (Exception e) {
                    Console.WriteLine($"[RabbitMQ] Error publishing bulk delete: {e.Message}");
                    await Task.Delay(10);
                }
            } while (!publishSuccess);
            yield return $"{clr.r:X2} {clr.g:X2} {clr.b:X2} | {color:X8} | {sw.Elapsed} (waiting {Math.Max(0, (int)delay - (int)sw.ElapsedMilliseconds)} out of {delay} ms)";
            await Task.Delay(Math.Max(0, (int)delay - (int)sw.ElapsedMilliseconds));
            sw.Restart();
        }
    }
}
