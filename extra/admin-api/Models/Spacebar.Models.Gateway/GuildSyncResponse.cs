using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.Models.Gateway;

public class GuildSyncResponse {
    [JsonPropertyName("id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long GuildId { get; set; }

    [JsonPropertyName("presences")]
    public List<Presence> Presences { get; set; }

    [JsonPropertyName("members")]
    public List<Member> Members { get; set; }
}