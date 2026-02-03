using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

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
            Avatar = m.Avatar,
            Banner = m.Banner,
            Collectibles = m.Collectibles,
            DisplayNameStyles = m.DisplayNameStyles,
            Bio = m.Bio,
            Nick = m.Nick
        });
        var presences = members.Select(x => x.IdNavigation).Where(x => x.Sessions.Count > 0).ToDictionary(x => x.Id, x => {
            var sortedSessions = x.Sessions.OrderByDescending(s => s.LastSeen).ToList();
            return new PresenceResponse() {
                GuildId = guildId,
                User = mappedPartialUsers[x.Id],
                Activities = x.Sessions.SelectMany(s => JsonSerializer.Deserialize<object[]>(s.Activities)).ToList(),
                Status = sortedSessions.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s.Status))?.Status ?? "offline",
                ClientStatus = JsonSerializer.Deserialize<PresenceResponse.ClientStatuses>(sortedSessions.First(s => !string.IsNullOrWhiteSpace(s.ClientStatus)).ClientStatus)
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

public class GuildSyncResponse {
    [JsonPropertyName("id")]
    public string GuildId { get; set; }

    [JsonPropertyName("presences")]
    public List<PresenceResponse> Presences { get; set; }

    [JsonPropertyName("members")]
    public List<Member> Members { get; set; }
}

public class PresenceResponse {
    [JsonPropertyName("user")]
    public required PartialUser User { get; set; }

    [JsonPropertyName("guild_id"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? GuildId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "unknown";

    [JsonPropertyName("activities")]
    public List<object> Activities { get; set; }

    [JsonPropertyName("hidden_activities")]

    public List<object?> HiddenActivities { get; set; }

    [JsonPropertyName("client_status")]
    public ClientStatuses ClientStatus { get; set; }

    [JsonPropertyName("has_played_game")]
    public bool? HasPlayedGame { get; set; }

    [SuppressMessage("ReSharper", "UnusedMember.Local")]
    public class ClientStatuses {
        [JsonPropertyName("desktop"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Desktop { get; set; }

        [JsonPropertyName("mobile"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Mobile { get; set; }

        [JsonPropertyName("web"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Web { get; set; }

        [JsonPropertyName("embedded"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Embedded { get; set; }

        [JsonPropertyName("vr"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Vr { get; set; }
    }
}

[DebuggerDisplay("{Id} ({Username}#{Discriminator})")]
public class PartialUser {
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("username")]
    public string Username { get; set; }

    [JsonPropertyName("discriminator")]
    public string Discriminator { get; set; }

    [JsonPropertyName("global_name")]
    public string? GlobalName { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("avatar_decoration_data")]
    public object? AvatarDecorationData { get; set; }

    [JsonPropertyName("collectibles")]
    public object? Collectibles { get; set; }

    [JsonPropertyName("display_name_styles")]
    public object? DisplayNameStyles { get; set; }

    [JsonPropertyName("primary_guild")]
    public object? PrimaryGuild { get; set; }

    [JsonPropertyName("bot")]
    public bool? Bot { get; set; }

    [JsonPropertyName("system")]
    public bool? System { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("accent_color")]
    public int? AccentColor { get; set; }

    [JsonPropertyName("public_flags")]
    public ulong? PublicFlags { get; set; }
}

[DebuggerDisplay("{User.Id} ({User.Username}#{User.Discriminator})")]
public class Member {
    [JsonPropertyName("user")]
    public required PartialUser User { get; set; }

    [JsonPropertyName("nick")]
    public string? Nick { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("avatar_decoration_data")]
    public object? AvatarDecorationData { get; set; }

    [JsonPropertyName("collectibles")]
    public object? Collectibles { get; set; }

    [JsonPropertyName("display_name_styles")]
    public object? DisplayNameStyles { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }
}