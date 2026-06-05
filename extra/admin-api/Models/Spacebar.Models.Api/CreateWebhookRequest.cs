using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class CreateWebhookRequest {
    [JsonPropertyName("name")]
    public required string Name { get; set; }
    
    [JsonPropertyName("avatar")]
    public string? AvatarData { get; set; }
}