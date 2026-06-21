using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.DataMappings.Generic;
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
    // TODO: actually return something?
    public async IAsyncEnumerable<ContentlessReplicationMessage> DoLazyRequest([FromBody] LazyRequest payload) {
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

        var memberList = await GetGuildMemberListAsync(db, payload.GuildId);

        yield return new ReplicationMessage<GuildMemberListUpdate>() {
            UserId = user.Result.Id,
            Event = GuildMemberListUpdate.EventId,
            Origin = "Offload/LazyRequest",
            CreatedAt = DateTime.UtcNow,
            Payload = new GuildMemberListUpdate() {
                GuildId = payload.GuildId,
                ListId = payload.GuildId.ToString(),
                OnlineCount = memberList.TakeWhile(x => x is not RoleEntry { Id: "offline" }).Count(),
                MemberCount = await db.Members.CountAsync(x => x.GuildId == payload.GuildId),
                Operations = [
                    new GuildMemberListUpdateOperation.SyncOperation() {
                        Items = memberList.Select<IMemberListEntry, GuildMemberListSyncItem>(item => item is RoleEntry re
                                ? new GuildMemberListSyncItem.RoleEntry() { Id = re.Id, Count = re.Count }
                                : item is MemberEntry me
                                    ? new GuildMemberListSyncItem.MemberEntry() { Member = me.Member }
                                    : throw new InvalidCastException("List item was neither RoleEntry nor MemberEntry???"))
                            .ToList(),
                        Range = [0, memberList.Count]
                    }
                ],
                Groups = memberList.OfType<RoleEntry>().Select(re => new GuildMemberListSyncItem.RoleEntry() { Id = re.Id, Count = re.Count }).ToList()
            }
            // TODO: send presence updates
            // TODO: handle subscriptions
            // TODO: handle channel permissions
            // TODO: handle channels at all
        };
    }

    private async Task<string?> GetMemberListIdAsync(SpacebarDbContext db, long guildId, long channelId) {
        var channel = await db.Channels.AsNoTracking().FirstOrDefaultAsync(c => c.Id == channelId && c.GuildId == guildId);
        if (channel == null) return null;

        if (string.IsNullOrWhiteSpace(channel.PermissionOverwrites) || channel.PermissionOverwrites == "[]") {
            return "everyone";
        }

        return null; // TODO
    }

    private async Task<List<IMemberListEntry>> GetGuildMemberListAsync(SpacebarDbContext db, long guildId) {
        var memberList = new List<IMemberListEntry>();

        // Fetch hoisted roles for the guild to define groups
        var hoistedRoles = await db.Roles
            .AsNoTracking()
            .Where(r => r.GuildId == guildId && r.Hoist)
            .OrderByDescending(r => r.Position)
            // .Select(r => r.Id)
            .ToListAsync();

        logger.LogDebug("Got hoisted roles: {roleIds}", hoistedRoles.Select(x => x.Id).ToList());
        List<long> handledRoles = [];
        foreach (var roleObj in hoistedRoles) {
            var role = roleObj.Id;
            var members = await db.Members.AsNoTracking()
                .Include(x => x.IdNavigation)
                .Where(x =>
                    x.GuildId == guildId
                    && x.Roles.Any(r => r.Id == role)
                    && !x.Roles.Any(r => handledRoles.Contains(r.Id))
                    // and finally, filter by online
                    && x.IdNavigation.Sessions.Any(s => s.Status != "offline" && s.Status != "invisible" && s.Status != "unknown")
                )
                .OrderBy(x => x.Nick ?? x.IdNavigation.Username).ToListAsync();

            logger.LogInformation("Got {count} potential members for group {group} ({groupName}):\n - {members}",
                members.Count, role, roleObj.Name, string.Join("\n - ", members.Take(10).Select(x => $"{x.Id} {x.Nick ?? x.IdNavigation.Tag}"))
            );

            memberList.Add(new RoleEntry() { Id = role.ToString(), Count = members.Count });
            memberList.AddRange(members.Select(m => (IMemberListEntry)new MemberEntry() { Member = m.ToPublicMember() }));

            handledRoles.Add(role);
        }

        // online members
        var onlineMembers = await db.Members.AsNoTracking()
            .Include(x => x.IdNavigation)
            // .ThenInclude(x=>x.Sessions)
            .Where(x =>
                x.GuildId == guildId
                && !x.Roles.Any(r => handledRoles.Contains(r.Id))
                // and finally, filter by online
                && x.IdNavigation.Sessions.Any(s => s.Status != "offline" && s.Status != "invisible" && s.Status != "unknown")
            )
            .OrderBy(x => x.Nick ?? x.IdNavigation.Username).ToListAsync();

        logger.LogInformation("Got {count} potential members for group {group} ({groupName}):\n - {members}",
            onlineMembers.Count, "online", "online", string.Join("\n - ", onlineMembers.Take(10).Select(x => $"{x.Id} {x.Nick ?? x.IdNavigation.Tag}"))
        );

        if (onlineMembers.Count > 0) {
            memberList.Add(new RoleEntry() { Id = "online", Count = onlineMembers.Count });
            memberList.AddRange(onlineMembers.Select(m => (IMemberListEntry)new MemberEntry() { Member = m.ToPublicMember() }));
        }

        if (memberList.Count < 2000) {
            logger.LogInformation("Less than 2000 members, including offline members...");
            var offlineMembers = await db.Members.AsNoTracking()
                .Include(x => x.IdNavigation)
                // .ThenInclude(x=>x.Sessions)
                .Where(x =>
                    x.GuildId == guildId
                    && !x.Roles.Any(r => handledRoles.Contains(r.Id))
                    // and finally, filter by online
                    && (x.IdNavigation.Sessions.Any(s => s.Status == "offline" || s.Status == "invisible" || s.Status == "unknown") || !x.IdNavigation.Sessions.Any())
                )
                .OrderBy(x => x.Nick ?? x.IdNavigation.Username).ToListAsync();

            logger.LogInformation("Got {count} potential members for group {group} ({groupName}):\n - {members}",
                offlineMembers.Count, "offline", "offline", string.Join("\n - ", offlineMembers.Take(10).Select(x => $"{x.Id} {x.Nick ?? x.IdNavigation.Tag}"))
            );

            if (offlineMembers.Count > 0) {
                memberList.Add(new RoleEntry() { Id = "offline", Count = offlineMembers.Count });
                memberList.AddRange(offlineMembers.Select(m => (IMemberListEntry)new MemberEntry() { Member = m.ToPublicMember() }));
            }
        }

        logger.LogInformation("Got member list with {count} total nodes", memberList.Count);
        return memberList;
    }
}

internal interface IMemberListEntry { }

internal struct RoleEntry : IMemberListEntry {
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

internal struct MemberEntry : IMemberListEntry {
    [JsonPropertyName("member")]
    public Member Member { get; set; }
}