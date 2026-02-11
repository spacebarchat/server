using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

// TODO: move to interop
public class SbWebsocketMeta
{
    [JsonPropertyName("user_id")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("session_id")]
    public string SessionId { get; set; } = string.Empty;

    [JsonPropertyName("accessToken")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("encoding")]
    public string Encoding { get; set; } = "json";

    [JsonPropertyName("compress")]
    public string? Compress { get; set; }

    [JsonPropertyName("ipAddress")]
    public string? IpAddress { get; set; }

    [JsonPropertyName("userAgent")]
    public string? UserAgent { get; set; }

    [JsonPropertyName("fingerprint")]
    public string? Fingerprint { get; set; }

    [JsonPropertyName("shard_count")]
    public int? ShardCount { get; set; }

    [JsonPropertyName("shard_id")]
    public int? ShardId { get; set; }

    [JsonPropertyName("intents")]
    public GatewayIntentFlags Intents { get; set; } = default!;

    [JsonPropertyName("sequence")]
    public long Sequence { get; set; }

    [JsonPropertyName("capabilities")]
    public GatewayCapabilityFlags? Capabilities { get; set; }

    [JsonPropertyName("large_threshold")]
    public int LargeThreshold { get; set; }

    [JsonPropertyName("qos")]
    public QoSPayload? Qos { get; set; }
}