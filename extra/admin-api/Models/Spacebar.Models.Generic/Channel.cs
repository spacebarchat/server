using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class ChannelPermissionOverwrite {
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("type")]
    public int Type { get; set; }

    [JsonPropertyName("allow"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public ulong Allow { get; set; }

    [JsonPropertyName("deny"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public ulong Deny { get; set; }
}