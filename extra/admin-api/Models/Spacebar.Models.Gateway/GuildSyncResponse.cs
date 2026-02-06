using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.Models.Gateway;

public class GuildSyncResponse {
    [JsonPropertyName("id")]
    public string GuildId { get; set; }

    [JsonPropertyName("presences")]
    public List<PresenceResponse> Presences { get; set; }

    [JsonPropertyName("members")]
    public List<Member> Members { get; set; }
}