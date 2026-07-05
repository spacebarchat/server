using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.Models.Generic;

namespace Spacebar.DataMappings.Generic;

public static class MemberExtensions
{
    public static Member ToPublicMember(this Models.Db.Models.Member member, PartialUser? partialUser = null)
    {
        return new()
        {
            User = partialUser ?? member.IdNavigation.ToPartialUser(),
            AvatarDecorationData = string.IsNullOrWhiteSpace(member.AvatarDecorationData) ? null : JsonSerializer.Deserialize<JsonObject>(member.AvatarDecorationData), // TODO: schema
            Avatar = string.IsNullOrWhiteSpace(member.Avatar) ? null : member.Avatar,
            Banner = string.IsNullOrWhiteSpace(member.Banner) ? null : member.Banner,
            Collectibles = string.IsNullOrWhiteSpace(member.Collectibles) ? null : JsonSerializer.Deserialize<JsonObject>(member.Collectibles), // TODO: schema,
            DisplayNameStyles = JsonSerializer.Deserialize<DisplayNameStyle>(member.DisplayNameStyles ?? "null"),
            Bio = string.IsNullOrWhiteSpace(member.Bio) ? null : member.Bio,
            Nick = string.IsNullOrWhiteSpace(member.Nick) ? null : member.Nick,
            Roles = member.Roles.Select(x => x.Id).ToList()
        };
    }

    public static MemberWithPresence ToPublicMemberWithPresence(this Models.Db.Models.Member member, PartialUser? partialUser = null)
    {
        var onlineSessions = member.IdNavigation.Sessions.Where(x => x.Status is not ("offline" or "invisible" or "unknown")).ToList();
        var presence = new Presence()
        {
            User = partialUser ?? member.IdNavigation.ToPartialUser(),
            Status = onlineSessions.OrderByDescending(x => x.LastSeen).FirstOrDefault()?.Status ?? "offline",
            GuildId = member.GuildId,
            Activities = onlineSessions.SelectMany(x => x.GetActivities()).ToList(),
            ClientStatus = !onlineSessions.Any() ? new() : onlineSessions.Aggregate(new Presence.ClientStatuses() { }, (res, sess) =>
            {
                var cs = sess.GetClientStatuses();
                string? Maybe(string? source)
                {
                    if (!string.IsNullOrWhiteSpace(source) && source is not ("offline" or "invisible" or "unknown")) return source;
                    return null;
                }

                res.Desktop ??= Maybe(cs.Desktop);
                res.Embedded ??= Maybe(cs.Embedded);
                res.Mobile ??= Maybe(cs.Mobile);
                res.Vr ??= Maybe(cs.Vr);
                res.Web ??= Maybe(cs.Web);

                return res;
            })
        };

        return new()
        {
            User = partialUser ?? member.IdNavigation.ToPartialUser(),
            AvatarDecorationData = string.IsNullOrWhiteSpace(member.AvatarDecorationData) ? null : JsonSerializer.Deserialize<JsonObject>(member.AvatarDecorationData), // TODO: schema
            Avatar = string.IsNullOrWhiteSpace(member.Avatar) ? null : member.Avatar,
            Banner = string.IsNullOrWhiteSpace(member.Banner) ? null : member.Banner,
            Collectibles = string.IsNullOrWhiteSpace(member.Collectibles) ? null : JsonSerializer.Deserialize<JsonObject>(member.Collectibles), // TODO: schema
            DisplayNameStyles = JsonSerializer.Deserialize<DisplayNameStyle>(member.DisplayNameStyles ?? "null"),
            Bio = string.IsNullOrWhiteSpace(member.Bio) ? null : member.Bio,
            Nick = string.IsNullOrWhiteSpace(member.Nick) ? null : member.Nick,
            Roles = member.Roles.Select(x => x.Id).ToList(),
            Presence = presence
        };
    }
}