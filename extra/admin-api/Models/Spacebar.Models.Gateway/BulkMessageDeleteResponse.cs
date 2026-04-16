using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class BulkMessageDeleteResponse {
    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long ChannelId { get; set; }

    [JsonPropertyName("ids"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required List<long> MessageIds { get; set; }
}