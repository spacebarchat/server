using System.Diagnostics;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

[DebuggerDisplay("{Id} ({Name})")]
public class Guild {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("afk_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long? AfkChannelId { get; set; }

    [JsonPropertyName("afk_timeout")]
    public int AfkTimeout { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("channels")]
    public List<Channel> Channels { get; set; }

    [JsonPropertyName("default_message_notifications")]
    public int DefaultMessageNotifications { get; set; } // TODO enum

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("discovery_splash")]
    public string? DiscoverySplash { get; set; }

    [JsonPropertyName("emojis")]
    public List<Emoji> Emojis { get; set; }

    [JsonPropertyName("explicit_content_filter")]
    public int ExplicitContentFilter { get; set; }

    [JsonPropertyName("features")]
    public List<string> Features { get; set; }

    [JsonPropertyName("guild_scheduled_events")]
    public List<object> GuildScheduledEvents { get; set; } // TODO: implement

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("joined_at")]
    public DateTimeOffset JoinedAt { get; set; }

    [JsonPropertyName("large")]
    public bool Large { get; set; }

    [JsonPropertyName("max_members")]
    public int MaxMembers { get; set; }

    [JsonPropertyName("max_presences")]
    public int MaxPresences { get; set; }

    [JsonPropertyName("max_video_channel_users")]
    public int MaxVideoChannelUsers { get; set; }

    [JsonPropertyName("member_count")]
    public int MemberCount { get; set; }

    [JsonPropertyName("mfa_level")]
    public int MfaLevel { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("nsfw_level")]
    public int NsfwLevel { get; set; }

    [JsonPropertyName("owner_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long OwnerId { get; set; }

    [JsonPropertyName("preferred_locale")]
    public string PreferredLocale { get; set; }

    [JsonPropertyName("premium_progress_bar_enabled")]
    public bool? PremiumProgressBarEnabled { get; set; }

    [JsonPropertyName("premium_subscription_count")]
    public int PremiumSubscriptionCount { get; set; }

    [JsonPropertyName("premium_tier")]
    public int PremiumTier { get; set; }

    [JsonPropertyName("presences")]
    public List<Presence> Presences { get; set; } // TODO: correct type?

    [JsonPropertyName("public_updates_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? PublicUpdatesChannelId { get; set; }

    [JsonPropertyName("region")]
    public string Region { get; set; }

    [JsonPropertyName("roles")]
    public List<Role> Roles { get; set; }

    [JsonPropertyName("rules_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? RulesChannelId { get; set; }

    [JsonPropertyName("splash")]
    public string? Splash { get; set; }

    [JsonPropertyName("stickers")]
    public List<Sticker> Stickers { get; set; }

    [JsonPropertyName("system_channel_flags")]
    public int SystemChannelFlags { get; set; } //TODO enum

    [JsonPropertyName("system_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? SystemChannelId { get; set; }

    [JsonPropertyName("threads")]
    public List<Channel> Threads { get; set; }

    [JsonPropertyName("verification_level")]
    public int VerificationLevel { get; set; }

    [JsonPropertyName("voice_states")]
    public List<object> VoiceStates { get; set; } // TODO: models

    [JsonPropertyName("welcome_screen")]
    public object WelcomeScreen { get; set; } // TODO: models

    [JsonPropertyName("widget_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? WidgetChannelId { get; set; }

    [JsonPropertyName("widget_enabled")]
    public bool WidgetEnabled { get; set; }
}