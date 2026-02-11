using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

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