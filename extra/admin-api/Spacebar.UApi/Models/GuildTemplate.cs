using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.UApi.Models;

public class GuildTemplate {
    [JsonPropertyName("code")]
    public string Code { get; set; } = null!;

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("usage_count")]
    public int UsageCount { get; set; }

    [JsonPropertyName("creator_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? CreatorId { get; set; }

    [JsonPropertyName("creator")]
    public PartialUser? Creator { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    [JsonPropertyName("source_guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? SourceGuildId { get; set; }

    [JsonPropertyName("serialized_source_guild")]
    public SerializedSourceGuild SerializedSourceGuild { get; set; } = null!;
}

public class SerializedSourceGuild {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("region")]
    public string? Region { get; set; }

    [JsonPropertyName("verification_level")]
    public int? VerificationLevel { get; set; }

    [JsonPropertyName("default_message_notifications")]
    public int? DefaultMessageNotifications { get; set; }

    [JsonPropertyName("explicit_content_filter")]
    public int? ExplicitContentFilter { get; set; }

    [JsonPropertyName("preferred_locale")]
    public string? PreferredLocale { get; set; }

    [JsonPropertyName("afk_timeout")]
    public int? AfkTimeout { get; set; }

    [JsonPropertyName("afk_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? AfkChannelId { get; set; }

    [JsonPropertyName("system_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? SystemChannelId { get; set; }

    [JsonPropertyName("system_channel_flags")]
    public int? SystemChannelFlags { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("roles")]
    public List<GuildTemplateRole> Roles { get; set; } = [];

    [JsonPropertyName("channels")]
    public List<GuildTemplateChannel> Channels { get; set; } = [];
}

public class GuildTemplateRole {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("permissions")]
    public string Permissions { get; set; } = null!;

    [JsonPropertyName("colors")]
    public RoleColors Colors { get; set; } = new();

    [JsonPropertyName("hoist")]
    public bool Hoist { get; set; }

    [JsonPropertyName("mentionable")]
    public bool Mentionable { get; set; }

    [JsonPropertyName("position")]
    public int Position { get; set; }

    [JsonPropertyName("managed")]
    public bool? Managed { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("unicode_emoji")]
    public string? UnicodeEmoji { get; set; }

    [JsonPropertyName("flags")]
    public int? Flags { get; set; }
}

public class GuildTemplateChannel {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long Id { get; set; }

    [JsonPropertyName("type")]
    public int Type { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("position")]
    public int? Position { get; set; }

    [JsonPropertyName("parent_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ParentId { get; set; }

    [JsonPropertyName("topic")]
    public string? Topic { get; set; }

    [JsonPropertyName("bitrate")]
    public int? Bitrate { get; set; }

    [JsonPropertyName("user_limit")]
    public int? UserLimit { get; set; }

    [JsonPropertyName("nsfw")]
    public bool? Nsfw { get; set; }

    [JsonPropertyName("rate_limit_per_user")]
    public int? RateLimitPerUser { get; set; }

    [JsonPropertyName("permission_overwrites")]
    public List<GuildTemplateChannelPermissionOverwrite> PermissionOverwrites { get; set; } = [];
}

public class GuildTemplateChannelPermissionOverwrite {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long Id { get; set; }

    [JsonPropertyName("type")]
    public int Type { get; set; }

    [JsonPropertyName("allow")]
    public string Allow { get; set; } = "0";

    [JsonPropertyName("deny")]
    public string Deny { get; set; } = "0";
}

public class RoleColors {
    [JsonPropertyName("primary_color")]
    public int PrimaryColor { get; set; }

    [JsonPropertyName("secondary_color")]
    public int? SecondaryColor { get; set; }

    [JsonPropertyName("tertiary_color")]
    public int TertiaryColor { get; set; }
}
