using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.Models.Gateway;

public class PresenceResponse {
    [JsonPropertyName("user")]
    public required PartialUser User { get; set; }

    [JsonPropertyName("guild_id"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? GuildId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "unknown";

    // TODO
    [JsonPropertyName("activities")]
    public List<JsonObject> Activities { get; set; }

    // TODO
    [JsonPropertyName("hidden_activities")]
    public List<JsonObject> HiddenActivities { get; set; }

    [JsonPropertyName("client_status")]
    public ClientStatuses ClientStatus { get; set; }

    [JsonPropertyName("has_played_game")]
    public bool? HasPlayedGame { get; set; }

    [SuppressMessage("ReSharper", "UnusedMember.Local")]
    public class ClientStatuses {
        [JsonPropertyName("desktop"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Desktop { get; set; }

        [JsonPropertyName("mobile"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Mobile { get; set; }

        [JsonPropertyName("web"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Web { get; set; }

        [JsonPropertyName("embedded"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Embedded { get; set; }

        [JsonPropertyName("vr"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Vr { get; set; }
    }
}