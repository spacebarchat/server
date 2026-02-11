using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class QoSPayload {
    [JsonPropertyName("ver")]
    public int Version { get; set; }

    [JsonPropertyName("active")]
    public bool Active { get; set; }

    [JsonPropertyName("reasons")]
    public List<string> Reasons { get; set; } = [];
}