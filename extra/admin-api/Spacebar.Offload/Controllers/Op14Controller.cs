using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
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
using Spacebar.Models.Generic.Constants;
using Spacebar.Offload.Extensions;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/LazyRequest")]
public class Op14Controller(ILogger<Op12Controller> logger, SpacebarAspNetAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp) : ControllerBase
{
    [HttpPost]
    // TODO: actually return something?
    public async IAsyncEnumerable<ContentlessReplicationMessage> DoLazyRequest([FromBody] LazyRequest payload)
    {
        var user = await TraceResult.TraceAsync("getAuthUser", () => authService.GetCurrentUserAsync(Request));
        var session = await TraceResult.TraceAsync("getAuthSession", () => authService.GetCurrentSessionAsync(Request));

        if (!await db.Members.AsNoTracking().AnyAsync(m => m.GuildId == payload.GuildId && m.Id == user.Result.Id))
        {
            logger.LogWarning("User {user} requested lazy member list for guild {guildId}, but is not a member", user.Result.Id, payload.GuildId);
            yield break;
        }

        if (payload.Channels.Count == 0)
        {
            logger.LogWarning("User {user} requested lazy member list for guild {guildId}, but did not request a channel range", user.Result.Tag, payload.GuildId);
            yield break;
        }

        var memberList = await GetGuildMemberListAsync(db, payload.GuildId);

        foreach (var (cid, ranges) in payload.Channels)
        foreach (var range in ranges)
            yield return new ReplicationMessage<GuildMemberListUpdate>()
            {
                UserId = user.Result.Id,
                Event = GuildMemberListUpdate.EventId,
                Origin = "Offload/LazyRequest",
                CreatedAt = DateTime.UtcNow,
                Payload = new GuildMemberListUpdate()
                {
                    GuildId = payload.GuildId,
                    // this doesnt appear to work currently, skip it
                    ListId = "everyone", // await GetMemberListIdAsync(db, guildId: payload.GuildId, channelId: long.Parse(cid)),
                    OnlineCount = memberList.TakeWhile(x => x is not GuildMemberListSyncItem.RoleEntry { Group.Id: "offline" }).Count(),
                    MemberCount = await db.Members.CountAsync(x => x.GuildId == payload.GuildId),
                    Operations =
                    [
                        new GuildMemberListUpdateOperation.SyncOperation()
                        {
                            Operation = GuildMemberListUpdateOperationType.Sync,
                            Items = memberList.Skip(range[0]).Take(range[1]).ToList(),
                            Range = [range[0], Math.Min(range[1], memberList.Count)]
                        }
                    ],
                    Groups = memberList.OfType<GuildMemberListSyncItem.RoleEntry>().Select(x => x.Group).ToList()
                }
                // TODO: send presence updates
                // TODO: handle subscriptions
                // TODO: handle channel permissions
                // TODO: handle channels at all
                // TODO: reduce the amount of duplicate User objects sent?
            };
    }

    private async Task<string?> GetMemberListIdAsync(SpacebarDbContext db, long guildId, long channelId)
    {
        var channel = await db.Channels.AsNoTracking().FirstOrDefaultAsync(c => c.Id == channelId && c.GuildId == guildId);
        if (channel == null) return null;


        if (string.IsNullOrWhiteSpace(channel.PermissionOverwrites) || channel.PermissionOverwrites == "[]")
        {
            return "everyone";
        }

        List<string> perms = [];
        foreach (var overwrite in channel.MappedPermissionOverwrites)
        {
            if (((Permissions)overwrite.Allow).HasFlag(Permissions.ViewChannel)) perms.Add($"allow:{overwrite}");
            else if (((Permissions)overwrite.Deny).HasFlag(Permissions.ViewChannel)) perms.Add($"deny:{overwrite}");
        }

        perms.Sort();

        ReadOnlySpan<byte> hashData = Encoding.UTF8.GetBytes(string.Join(",", perms));
        var hashResult = MurmurHash3.Hash32(ref hashData);
        return hashResult.ToString();
    }

    private async Task<List<GuildMemberListSyncItem>> GetGuildMemberListAsync(SpacebarDbContext db, long guildId)
    {
        var memberList = new List<GuildMemberListSyncItem>();

        // Fetch hoisted roles for the guild to define groups
        var hoistedRoles = await db.Roles
            .AsNoTracking()
            .Where(r => r.GuildId == guildId && r.Hoist)
            .OrderByDescending(r => r.Position)
            // .Select(r => r.Id)
            .ToListAsync();

        logger.LogDebug("Got hoisted roles: {roleIds}", hoistedRoles.Select(x => x.Id).ToList());
        List<long> handledRoles = [];

        var baseMembersQry = db.Members.AsNoTracking()
            .Include(x => x.IdNavigation)
            .ThenInclude(x => x.Sessions.Where(s => s.Status != "offline" && s.Status != "invisible" && s.Status != "unknown"))
            .Include(x => x.Roles)
            .OrderBy(x => x.Nick ?? x.IdNavigation.Username)
            .Where(x=>x.GuildId == guildId);
        
        
        foreach (var roleObj in hoistedRoles)
        {
            var role = roleObj.Id;
            var members = await baseMembersQry
                .Where(x =>
                    x.Roles.Any(r => r.Id == role)
                    && !x.Roles.Any(r => handledRoles.Contains(r.Id))
                    // and finally, filter by online
                    && x.IdNavigation.Sessions.Any(s => s.Status != "offline" && s.Status != "invisible" && s.Status != "unknown")
                ).ToListAsync();

            logger.LogInformation("Got {count} potential members for group {group} ({groupName}): {members}",
                members.Count, role, roleObj.Name, string.Join(", ", members.Take(10).Select(x => $"{x.Id} {x.Nick ?? x.IdNavigation.Tag}"))
            );

            if (members.Count > 0)
            {
                memberList.Add(new GuildMemberListSyncItem.RoleEntry() { Group = new() { Id = role.ToString(), Count = members.Count } });
                memberList.AddRange(members.Select(m => new GuildMemberListSyncItem.MemberEntry() { Member = m.ToPublicMemberWithPresence() }));
            }

            handledRoles.Add(role);
        }

        // online members
        var onlineMembers = await baseMembersQry
            .Where(x =>
                !x.Roles.Any(r => handledRoles.Contains(r.Id))
                // and finally, filter by online
                && x.IdNavigation.Sessions.Any(s => s.Status != "offline" && s.Status != "invisible" && s.Status != "unknown")
            ).ToListAsync();

        logger.LogInformation("Got {count} potential members for group {group} ({groupName}): {members}",
            onlineMembers.Count, "online", "online", string.Join(", ", onlineMembers.Take(10).Select(x => $"{x.Id} {x.Nick ?? x.IdNavigation.Tag}"))
        );

        if (onlineMembers.Count > 0)
        {
            memberList.Add(new GuildMemberListSyncItem.RoleEntry() { Group = new() { Id = "online", Count = onlineMembers.Count } });
            memberList.AddRange(onlineMembers.Select(m => new GuildMemberListSyncItem.MemberEntry() { Member = m.ToPublicMemberWithPresence() }));
        }

        if (memberList.Count < 2000)
        {
            logger.LogInformation("Less than 2000 members, including offline members...");
            var offlineMembers = await baseMembersQry
                .Where(x =>
                    !x.Roles.Any(r => handledRoles.Contains(r.Id))
                    // and finally, filter by online
                    && (x.IdNavigation.Sessions.All(s => s.Status == "offline" || s.Status == "invisible" || s.Status == "unknown") || !x.IdNavigation.Sessions.Any())
                ).ToListAsync();

            logger.LogInformation("Got {count} potential members for group {group} ({groupName}): {members}",
                offlineMembers.Count, "offline", "offline", string.Join(", ", offlineMembers.Take(10).Select(x => $"{x.Id} {x.Nick ?? x.IdNavigation.Tag}"))
            );

            if (offlineMembers.Count > 0)
            {
                memberList.Add(new GuildMemberListSyncItem.RoleEntry()
                {
                    Group = new() { Id = "offline", Count = offlineMembers.Count }
                });
                memberList.AddRange(offlineMembers.Select(m => new GuildMemberListSyncItem.MemberEntry() { Member = m.ToPublicMemberWithPresence() }));
            }
        }

        logger.LogInformation("Got member list with {count} total nodes", memberList.Count);
        return memberList;
    }
}