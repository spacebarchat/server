using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.GatewayOffload.Extensions.Db;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Gateway;
using Spacebar.Models.Generic;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/LazyRequest")]
public class Op14Controller(ILogger<Op12Controller> logger, SpacebarAspNetAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp) : ControllerBase {
    [HttpPost]
    public async IAsyncEnumerable<ReplicationMessage> DoLazyRequest([FromBody] LazyRequest payload) {
        var user = await TraceResult.TraceAsync("getAuthUser", () => authService.GetCurrentUserAsync(Request));
        var session = await TraceResult.TraceAsync("getAuthSession", () => authService.GetCurrentSessionAsync(Request));

        if (!await db.Members.AsNoTracking().AnyAsync(m => m.GuildId == payload.GuildId && m.Id == user.Result.Id)) {
            logger.LogWarning("User {user} requested lazy member list for guild {guildId}, but is not a member", user.Result.Id, payload.GuildId);
            yield break;
        }

        if (payload.Channels.Count == 0) {
            logger.LogWarning("User {user} requested lazy member list for guild {guildId}, but is not a member", user.Result.Tag, payload.GuildId);
            yield break;
        }

        // Fetch hoisted roles for the guild to define groups
        var hoistedRoles = await db.Roles
            .AsNoTracking()
            .Where(r => r.GuildId == payload.GuildId && r.Hoist)
            .OrderByDescending(r => r.Position)
            .Select(r => new { r.Id })
            .ToListAsync();
    }

    private async Task<string?> GetMemberListIdAsync(SpacebarDbContext db, string guildId, string channelId) {
        var channel = await db.Channels.AsNoTracking().FirstOrDefaultAsync(c => c.Id == channelId && c.GuildId == guildId);
        if (channel == null) return null;

        if (string.IsNullOrWhiteSpace(channel.PermissionOverwrites) || channel.PermissionOverwrites == "[]") {
            return "everyone";
        }

        return null; // TODO
    }
}