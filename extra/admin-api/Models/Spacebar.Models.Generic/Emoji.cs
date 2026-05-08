using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class Emoji {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }
    
    [JsonPropertyName("animated")]
    public bool Animated { get; set; }
    
    [JsonPropertyName("available")]
    public bool Available { get; set; }
    
    [JsonPropertyName("groups")]
    public object? Groups { get; set; } // TODO: what is this?
    
    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long GuildId { get; set; }
    
    [JsonPropertyName("managed")]
    public bool Managed { get; set; }
    
    [JsonPropertyName("name")]
    public required string Name { get; set; }
    
    [JsonPropertyName("require_colons")]
    public bool RequireColons { get; set; }
    
    [JsonPropertyName("roles")]
    public List<object?> Roles { get; set; } // TODO: what type was this again?
    
    [JsonPropertyName("user_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long UserId { get; set; }
}