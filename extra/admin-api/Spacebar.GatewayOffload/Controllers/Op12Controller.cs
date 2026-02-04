using System.Text.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Gateway;
using Spacebar.Models.Generic;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/GuildSync")]
public class Op12Controller(ILogger<Op12Controller> logger, SpacebarAspNetAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp) : ControllerBase {
    [HttpPost("")]
    public async IAsyncEnumerable<ReplicationMessage> DoGuildSync(List<string> guildIds) {
        var user = await authService.GetCurrentUserAsync(Request);
        guildIds = (await db.Members.Where(x => x.Id == user.Id).Select(x => x.GuildId).ToListAsync())
            .Intersect(guildIds)
            .OrderByDescending(gi => db.Members.Count(m => m.GuildId == gi))
            .ToList();

        var syncs = guildIds.Select(GetGuildSyncAsync).ToList().ToAsyncResultEnumerable();
        await foreach (var res in syncs) {
            yield return new() {
                Origin = "OFFLOAD_GUILD_SYNC",
                UserId = user.Id,
                Event = "GUILD_SYNC",
                CreatedAt = DateTime.Now,
                Payload = res
            };
        }
    }

    private async Task<GuildSyncResponse> GetGuildSyncAsync(string guildId) {
        await using var sc = sp.CreateAsyncScope();
        var offlineTreshold = DateTime.Now.Subtract(TimeSpan.FromDays(14));
        var _db = sc.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        var memberCount = await _db.Members.Where(x => x.GuildId == guildId).CountAsync();
        var members = await _db.Members.Where(x => x.GuildId == guildId)
            .Include(x => x.IdNavigation)
            .ThenInclude(x => x.Sessions.Where(s =>
                !s.IsAdminSession && (s.Status != "offline" && s.Status != "invisible") && (memberCount < 1000 || s.LastSeen >= offlineTreshold)))
            .Where(x => x.IdNavigation.Sessions.Count > 0) // ignore members without sessions
            .ToListAsync();

        var mappedPartialUsers = members.Select(x => x.IdNavigation).ToDictionary(x => x.Id, x => new PartialUser() {
            Id = x.Id,
            Discriminator = x.Discriminator,
            Username = x.Username,
            AccentColor = x.AccentColor,
            Avatar = x.Avatar,
            AvatarDecorationData = x.AvatarDecorationData,
            Banner = x.Banner,
            Bot = x.Bot,
            Collectibles = x.Collectibles,
            DisplayNameStyles = x.DisplayNameStyles,
            // GlobalName = x.GlobalName,
            PrimaryGuild = x.PrimaryGuild,
            PublicFlags = x.PublicFlags,
            System = x.System,
        });
        var mappedMembers = members.ToDictionary(m => m.Id, m => new Member() {
            User = mappedPartialUsers[m.Id],
            AvatarDecorationData = m.AvatarDecorationData,
            Avatar = string.IsNullOrWhiteSpace(m.Avatar) ? null : m.Avatar,
            Banner = string.IsNullOrWhiteSpace(m.Banner) ? null : m.Banner,
            Collectibles = m.Collectibles,
            DisplayNameStyles = m.DisplayNameStyles,
            Bio = string.IsNullOrWhiteSpace(m.Bio) ? null : m.Bio,
            Nick = string.IsNullOrWhiteSpace(m.Nick) ? null : m.Nick
        });
        var presences = members.Select(x => x.IdNavigation).Where(x => x.Sessions.Count > 0).ToDictionary(x => x.Id, x => {
            var sortedSessions = x.Sessions.OrderByDescending(s => s.LastSeen).ToList();
            return new PresenceResponse() {
                GuildId = guildId,
                User = mappedPartialUsers[x.Id],
                Activities = x.Sessions.Where(s => s.Status is not ("offline" or "invisible" or "unknown"))
                    .SelectMany(s => JsonSerializer.Deserialize<JsonObject[]>(s.Activities) ?? []).ToList(),
                Status = sortedSessions.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s.Status))?.Status ?? "offline",
                ClientStatus = JsonSerializer.Deserialize<PresenceResponse.ClientStatuses>(sortedSessions.First(s => !string.IsNullOrWhiteSpace(s.ClientStatus)).ClientStatus) ?? new()
            };
        }).Where(x => x.Value.Activities.Count > 0).ToDictionary();

        var r = new GuildSyncResponse() {
            GuildId = guildId,
            Members = mappedMembers.Values.ToList(),
            Presences = presences.Values.ToList()
        };
        return r;
    }
}