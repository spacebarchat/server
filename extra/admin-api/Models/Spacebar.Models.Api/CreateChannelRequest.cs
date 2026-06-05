using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class CreateChannelRequest {
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("position")]
    public int? Position { get; set; }

    [JsonPropertyName("type")]
    public int? Type { get; set; } // TODO enum

    // 
    [JsonPropertyName("parent_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ParentId { get; set; }
    // TODO: rest of schema
}