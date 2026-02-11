using System.Collections.Frozen;
using System.Linq.Expressions;
using System.Text.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.DataMappings.Generic;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;
using Spacebar.Models.Gateway;
using Spacebar.Models.Generic;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/GuildSync")]
public class Op12Controller(ILogger<Op12Controller> logger, SpacebarAspNetAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp) : ControllerBase
{
    [HttpPost("")]
    public async IAsyncEnumerable<ReplicationMessage> DoGuildSync(List<string> guildIds)
    {
        var user = await authService.GetCurrentUserAsync(Request);
        guildIds = (await db.Members.AsNoTracking().Where(x => x.Id == user.Id).Select(x => x.GuildId).ToListAsync())
            .Intersect(guildIds)
            .OrderByDescending(gi => db.Members.Count(m => m.GuildId == gi))
            .ToList();

        var syncs = guildIds.Select(GetGuildSyncAsync).ToList().ToAsyncResultEnumerable();
        await foreach (var res in syncs)
        {
            yield return new()
            {
                Origin = "OFFLOAD_GUILD_SYNC",
                UserId = user.Id,
                Event = "GUILD_SYNC",
                CreatedAt = DateTime.Now,
                Payload = res
            };
        }
    }

    // TODO: figure out how to abstract this to a function without EFCore complaining about not being translatable...
    private static Expression<Func<Session, bool>> IsOnline = (Session session) => session.Status != "offline" && session.Status != "invisible" && session.Status != "unknown";

    private async Task<GuildSyncResponse> GetGuildSyncAsync(string guildId)
    {
        await using var sc = sp.CreateAsyncScope();
        var _db = sc.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        var memberCount = await _db.Members.AsNoTracking().Where(x => x.GuildId == guildId).CountAsync();

        var offlineTreshold = DateTime.Now.Subtract(TimeSpan.FromDays(14));
        var isLargeGuild = memberCount > 10000;

        var members = await _db.Members.AsNoTracking().Where(x => x.GuildId == guildId)
            .Include(x => x.IdNavigation)
            .ThenInclude(x => x.Sessions.Where(s =>
                !s.IsAdminSession && (
                    // see TODO on IsOnline - somehow need to replicate `IsOnline(s)`
                    s.Status != "offline" && s.Status != "invisible" && s.Status != "unknown"
                ) && (!isLargeGuild || s.LastSeen >= offlineTreshold)))
            .Where(x => x.IdNavigation.Sessions.Count > 0) // ignore members without sessions
            .ToListAsync();

        var mappedPartialUsers = members.Select(x => x.IdNavigation).ToFrozenDictionary(x => x.Id, x => x.ToPartialUser());
        var mappedMembers = members.ToFrozenDictionary(m => m.Id, m => m.ToPublicMember(mappedPartialUsers[m.Id]));

        var presences = members.Select(x => x.IdNavigation).Where(x => x.Sessions.Count > 0).ToFrozenDictionary(x => x.Id, x =>
        {
            var sortedSessions = x.Sessions.OrderByDescending(s => s.LastSeen).ToList();
            return new Presence()
            {
                GuildId = guildId,
                User = mappedPartialUsers[x.Id],
                Activities = x.Sessions.Where(s => s.Status is not ("offline" or "invisible" or "unknown"))
                    .SelectMany(s => JsonSerializer.Deserialize<JsonObject[]>(s.Activities) ?? []).ToList(),
                Status = sortedSessions.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s.Status))?.Status ?? "offline",
                ClientStatus = JsonSerializer.Deserialize<Presence.ClientStatuses>(sortedSessions.First(s => !string.IsNullOrWhiteSpace(s.ClientStatus)).ClientStatus) ??
                               new()
            };
        }).Where(x => x.Value.Activities.Count > 0).ToFrozenDictionary();

        var r = new GuildSyncResponse()
        {
            GuildId = guildId,
            Members = mappedMembers.Values.ToList(),
            Presences = presences.Values.ToList()
        };
        return r;
    }
}