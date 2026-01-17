using System.Text.Json.Serialization;

namespace Spacebar.Interop.Replication.Abstractions;

public class ReplicationMessage {
    [JsonPropertyName("channel_id")]
    public string? ChannelId { get; set; }

    [JsonPropertyName("guild_id")]
    public string? GuildId { get; set; }

    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("event")]
    public string Event { get; set; } = null!;

    [JsonPropertyName("origin")]
    public string? Origin { get; set; }

    [JsonPropertyName("data")]
    public object Payload { get; set; } = null!;
}