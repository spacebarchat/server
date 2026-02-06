using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class LazyRequest
{
    [JsonPropertyName("guild_id")]
    public string GuildId { get; set; }

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