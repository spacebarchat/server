using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/channels")]
public class ChannelController(
    ILogger<ChannelController> logger,
    SpacebarDbContext db,
    IServiceProvider sp,
    SpacebarAspNetAuthenticationService auth,
    ISpacebarReplication replication
) : ControllerBase {

    [HttpDelete("{id}")]
    public async Task DeleteById(string id) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        replication.SendAsync(new() {
            Origin = "AdminApi/DeleteChannelById",
            ChannelId = id,
            Event = "CHANNEL_DELETE",
            Payload = await db.Channels.SingleAsync (x=>x.Id == id)
        });

        await db.Channels.Where(x => x.Id == id).ExecuteDeleteAsync();
    }

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
                    ChannelId = channelId,
                    Event = "MESSAGE_BULK_DELETE",
                    Payload = new {
                        ids = messageIds,
                        channel_id = channelId,
                        guild_id = guildId,
                    },
                    Origin = "Admin API (GuildController.DeleteUser)",
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