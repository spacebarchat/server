using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class HelloResponse {
    [JsonPropertyName("heartbeat_interval")]
    public int HeartbeatInterval { get; set; }
}

public class IdentifyRequest {
    [JsonPropertyName("token")]
    public string Token { get; set; }

    [JsonPropertyName("properties")]
    public JsonObject ClientProperties { get; set; }

    [JsonPropertyName("compress")]
    public bool? Compress { get; set; }

    [JsonPropertyName("large_threshold")]
    public int? LargeTreshold { get; set; }

    [JsonPropertyName("shard")]
    public int[]? Shard { get; set; }

    [JsonPropertyName("presence")]
    public JsonObject? Presence { get; set; }

    [JsonPropertyName("intents")]
    public GatewayIntentFlags? Intents { get; set; }

    [JsonPropertyName("capabilities")]
    public GatewayCapabilityFlags? Capabilities { get; set; }

    [JsonPropertyName("client_state")]
    public JsonObject? ClientState { get; set; }
}

/// <summary>
/// This class defines all client properties used by discord
/// This should *not* be used as a schema, as the types are merely conventions, and the structure isn't well-defined.
/// </summary>
public class IdentifyClientProperties {
    [JsonPropertyName("os")]
    public string? OperatingSystem { get; set; }

    [JsonPropertyName("os_version")]
    public string? OperatingSystemVersion { get; set; }

    [JsonPropertyName("os_sdk_version")]
    public string? OperatingSystemSdkVersion { get; set; }

    [JsonPropertyName("os_arch")]
    public string? OperatingSystemArchitecture { get; set; }

    [JsonPropertyName("app_arch")]
    public string? ApplicationArchitecture { get; set; }

    [JsonPropertyName("browser")]
    public string? Browser { get; set; }

    [JsonPropertyName("browser_user_agent")]
    public string? BrowserUserAgent { get; set; }

    [JsonPropertyName("browser_version")]
    public string? BrowserVersion { get; set; }

    [JsonPropertyName("client_build_number")]
    public int? ClientBuildNumber { get; set; }

    [JsonPropertyName("native_build_number")]
    public int? NativeBuildNumber { get; set; }

    [JsonPropertyName("client_version")]
    public string? ClientVersion { get; set; }

    [JsonPropertyName("client_event_source")]
    public string? ClientEventSource { get; set; }

    [JsonPropertyName("client_app_state")]
    public string? ClientAppState { get; set; }

    [JsonPropertyName("client_launch_id")]
    public string? ClientLaunchId { get; set; }

    [JsonPropertyName("client_heartbeat_session_id")]
    public string? ClientHeartbeatSessionId { get; set; }

    [JsonPropertyName("client_performance_cpu")]
    public int? ClientPerformanceCpu { get; set; }

    [JsonPropertyName("client_performance_memory")]
    public int? ClientPerformanceMemory { get; set; }

    [JsonPropertyName("cpu_core_count")]
    public int? CpuCoreCount { get; set; }

    [JsonPropertyName("release_channel")]
    public string? ReleaseChannel { get; set; }

    [JsonPropertyName("system_locale")]
    public string? SystemLocale { get; set; }

    [JsonPropertyName("device")]
    public string? DeviceModel { get; set; }

    [JsonPropertyName("device_vendor_id")]
    public string? DeviceVendorId { get; set; }

    [JsonPropertyName("device_advertiser_id")]
    public string? DeviceAdvertiserId { get; set; }

    [JsonPropertyName("design_id")]
    public int? DesignId { get; set; }

    [JsonPropertyName("accessibility_support_enabled")]
    public string? AccessibilitySupportEnabled { get; set; }

    [JsonPropertyName("accessibility_features")]
    public int? AccessibilityFeatures { get; set; }

    [JsonPropertyName("window_manager")]
    public string? WindowManager { get; set; }

    [JsonPropertyName("distro")]
    public string? Distro { get; set; }

    [JsonPropertyName("runtime_environment")]
    public string? RuntimeEnvironment { get; set; }

    [JsonPropertyName("display_server")]
    public string? DisplayServer { get; set; }

    [JsonPropertyName("referrer")]
    public string? Referrer { get; set; }

    [JsonPropertyName("referrer_current")]
    public string? ReferrerCurrent { get; set; }

    [JsonPropertyName("referring_domain")]
    public string? ReferringDomain { get; set; }

    [JsonPropertyName("referring_domain_current")]
    public string? ReferringDomainCurrent { get; set; }

    [JsonPropertyName("search_engine")]
    public string? SearchEngine { get; set; }

    [JsonPropertyName("search_engine_current")]
    public string? SearchEngineCurrent { get; set; }

    [JsonPropertyName("mp_keyword")]
    public string? MpKeyword { get; set; }

    [JsonPropertyName("mp_keyword_current")]
    public string? MpKeywordCurrent { get; set; }

    [JsonPropertyName("utm_campaign")]
    public string? UtmCampaign { get; set; }

    [JsonPropertyName("utm_campaign_current")]
    public string? UtmCampaignCurrent { get; set; }

    [JsonPropertyName("utm_content")]
    public string? UtmContent { get; set; }

    [JsonPropertyName("utm_content_current")]
    public string? UtmContentCurrent { get; set; }

    [JsonPropertyName("utm_medium")]
    public string? UtmMedium { get; set; }

    [JsonPropertyName("utm_medium_current")]
    public string? UtmMediumCurrent { get; set; }

    [JsonPropertyName("utm_source")]
    public string? UtmSource { get; set; }

    [JsonPropertyName("utm_source_current")]
    public string? UtmSourceCurrent { get; set; }

    [JsonPropertyName("utm_term")]
    public string? UtmTerm { get; set; }

    [JsonPropertyName("utm_term_current")]
    public string? UtmTermCurrent { get; set; }

    [JsonPropertyName("has_client_mods")]
    public bool? HasClientMods { get; set; }

    [JsonPropertyName("launch_signature")]
    public string? LaunchSignature { get; set; }

    [JsonPropertyName("installation_id")]
    public string? InstallationId { get; set; }

    [JsonPropertyName("is_fast_connect")]
    public bool? IsFastConnect { get; set; }

    [JsonPropertyName("version")]
    public string? Version { get; set; }
}

[Flags]
public enum GatewayIntentFlags : ulong {
    Guilds = 1,
    GuildMembers = 1 << 1,
    GuildModeration = 1 << 2,
    GuildEmojisAndStickers = 1 << 3,
    GuildIntegrations = 1 << 4,
    GuildWebhooks = 1 << 5,
    GuildInvites = 1 << 6,
    GuildVoiceStates = 1 << 7,
    GuildPresences = 1 << 8,
    GuildMessages = 1 << 9,
    GuildMessageReactions = 1 << 10,
    GuildMessageTyping = 1 << 11,
    DirectMessages = 1 << 12,
    DirectMessageReactions = 1 << 13,
    DirectMessageTyping = 1 << 14,
    MessageContent = 1 << 15,
    GuildScheduledEvents = 1 << 16,
    PrivateEmbeddedActivities = 1 << 17,
    PrivateChannels = 1 << 18,
    Calls = 1 << 19,
    AutoModerationConfiguration = 1 << 20,
    AutoModerationExecution = 1 << 21,
    UserRelationships = 1 << 22,
    UserPresence = 1 << 23,
    GuildMessagePolls = 1 << 24,
    DirectMessagePolls = 1 << 25,
    DirectEmbeddedActivities = 1 << 26,
    Lobbies = 1 << 27,
    LobbyDelete = 1 << 28
}

[Flags]
public enum GatewayCapabilityFlags {
    LazyUserNotes = 1,
    NoAffineUserIds = 1 << 1,
    VersionedReadStates = 1 << 2,
    VersionedUserGuildSettings = 1 << 3,
    DedupeUserObjects = 1 << 4,
    PrioritizedReadyPayload = 1 << 5,
    MultipleGuildExperimentPopulations = 1 << 6,
    NonChannelReadStates = 1 << 7,
    AuthTokenRefresh = 1 << 8,
    UserSettingsProto = 1 << 9,
    ClientStateV2 = 1 << 10,
    PassiveGuildUpdate = 1 << 11,
    AutoCallConnect = 1 << 12,
    DebounceMessageReactions = 1 << 13,
    PassiveGuildUpdateV2 = 1 << 14,
    AutoLobbyConnect = 1 << 16
}