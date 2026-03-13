using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class BulkMessageDeleteResponse {
    [JsonPropertyName("guild_id")]
    public string? GuildId { get; set; }
    
    [JsonPropertyName("channel_id")]
    public required string ChannelId { get; set; }
    
    [JsonPropertyName("ids")]
    public required List<string> MessageIds { get; set; }
}