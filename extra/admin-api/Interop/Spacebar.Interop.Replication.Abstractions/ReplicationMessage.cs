using System.Text.Json.Serialization;

namespace Spacebar.Interop.Replication.Abstractions;

public class ContentlessReplicationMessage {
    [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ChannelId { get; set; }

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonPropertyName("user_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? UserId { get; set; }

    [JsonPropertyName("session_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? SessionId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("event")]
    public string Event { get; set; } = null!;

    [JsonPropertyName("origin")]
    public string? Origin { get; set; }

    [JsonPropertyName("reconnect_delay")]
    public int? ReconnectDelay { get; set; }
}

public class ReplicationMessage<TPayload> : ContentlessReplicationMessage {
    [JsonPropertyName("data")]
    public TPayload Payload { get; set; } = default!;
}