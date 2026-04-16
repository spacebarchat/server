using System.Text.Json.Serialization;

namespace Spacebar.Models.AdminApi;

public class DiscoverableGuildModel {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("afk_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? AfkChannelId { get; set; }

    [JsonPropertyName("afk_timeout")]
    public int? AfkTimeout { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("default_message_notifications")]
    public int? DefaultMessageNotifications { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("discovery_splash")]
    public string? DiscoverySplash { get; set; }

    [JsonPropertyName("explicit_content_filter")]
    public int? ExplicitContentFilter { get; set; }

    [JsonPropertyName("features")]
    public List<string> Features { get; set; }

    [JsonPropertyName("primary_category_id")]
    public long? PrimaryCategoryId { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("large")]
    public bool Large { get; set; }

    [JsonPropertyName("max_members")]
    public int? MaxMembers { get; set; }

    [JsonPropertyName("max_presences")]
    public int? MaxPresences { get; set; }

    [JsonPropertyName("max_video_channel_users")]
    public int? MaxVideoChannelUsers { get; set; }

    [JsonPropertyName("member_count")]
    public int? MemberCount { get; set; }

    [JsonPropertyName("presence_count")]
    public int? PresenceCount { get; set; }

    [JsonPropertyName("template_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? TemplateId { get; set; }

    [JsonPropertyName("mfa_level")]
    public int? MfaLevel { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("owner_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? OwnerId { get; set; }

    [JsonPropertyName("preferred_locale")]
    public string? PreferredLocale { get; set; }

    [JsonPropertyName("premium_subscription_count")]
    public int? PremiumSubscriptionCount { get; set; }

    [JsonPropertyName("premium_tier")]
    public int PremiumTier { get; set; }

    [JsonPropertyName("public_updates_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? PublicUpdatesChannelId { get; set; }

    [JsonPropertyName("rules_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? RulesChannelId { get; set; }

    [JsonPropertyName("region")]
    public string? Region { get; set; }

    [JsonPropertyName("splash")]
    public string? Splash { get; set; }

    [JsonPropertyName("system_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? SystemChannelId { get; set; }

    [JsonPropertyName("system_channel_flags")]
    public int? SystemChannelFlags { get; set; }

    [JsonPropertyName("unavailable")]
    public bool Unavailable { get; set; }

    [JsonPropertyName("verification_level")]
    public int? VerificationLevel { get; set; }

    [JsonPropertyName("welcome_screen")]
    public string WelcomeScreen { get; set; } = null!;

    [JsonPropertyName("widget_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? WidgetChannelId { get; set; }

    [JsonPropertyName("widget_enabled")]
    public bool WidgetEnabled { get; set; }

    [JsonPropertyName("nsfw_level")]
    public int? NsfwLevel { get; set; }

    [JsonPropertyName("nsfw")]
    public bool Nsfw { get; set; }

    [JsonPropertyName("parent")]
    public string? Parent { get; set; }

    [JsonPropertyName("premium_progress_bar_enabled")]
    public bool? PremiumProgressBarEnabled { get; set; }

    [JsonPropertyName("channel_ordering")]
    public List<string> ChannelOrdering { get; set; }

    [JsonPropertyName("discovery_weight")]
    public int DiscoveryWeight { get; set; }

    [JsonPropertyName("discovery_excluded")]
    public bool DiscoveryExcluded { get; set; }
}

public class DiscoverableGuildUpdateModel {
    [JsonPropertyName("discovery_weight")]
    public int? DiscoveryWeight { get; set; }

    [JsonPropertyName("discovery_excluded")]
    public bool? DiscoveryExcluded { get; set; }
}