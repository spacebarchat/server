using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class LazyRequest
{
    [JsonPropertyName("guild_id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long GuildId { get; set; }

    // key is string because json...
    [JsonPropertyName("channels")]
    public Dictionary<string, List<List<int>>> Channels { get; set; }

    [JsonPropertyName("members")]
    public bool Members { get; set; }

    [JsonPropertyName("threads")]
    public bool Threads { get; set; }

    [JsonPropertyName("activities")]
    public bool Activities { get; set; }

    [JsonPropertyName("typing")]
    public bool Typing { get; set; }
}