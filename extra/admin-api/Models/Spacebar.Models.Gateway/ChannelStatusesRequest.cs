using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class ChannelStatusesRequest {
    [JsonPropertyName("guild_id")]
    [JsonRequired]
    public JsonValue GuildIdRawValue { get; set; } = null!;

    [JsonIgnore]
    public string? GuildId {
        get => GuildIdRawValue.GetValueKind() == JsonValueKind.String ? GuildIdRawValue.GetValue<string>() : null;
        [MemberNotNull] set => GuildIdRawValue = JsonValue.Create(value!);
    }

    [JsonIgnore]
    public List<string>? GuildIds {
        get => GuildIdRawValue.GetValueKind() == JsonValueKind.Array ? GuildIdRawValue.AsArray().Deserialize<List<string>>() : null;
        [MemberNotNull] set => GuildIdRawValue = JsonValue.Create(value!)!;
    }
}

public class ChannelInfoRequest : ChannelStatusesRequest {
    [JsonPropertyName("fields")]
    public required List<string> Fields { get; set; }
}

public class ChannelStatus {
    [JsonPropertyName("id")]
    public string ChannelId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }
}

public class ChannelStatusesResponse {
    [JsonPropertyName("guild_id")]
    public string GuildId { get; set; }

    [JsonPropertyName("channels")]
    public List<ChannelStatus> Channels { get; set; }
}

public class ChannelInfo {
    [JsonPropertyName("id")]
    public required string ChannelId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("voice_start_time")]
    public DateTimeOffset? VoiceStartTime { get; set; }
}

public class ChannelInfoResponse {
    [JsonPropertyName("guild_id")]
    public string GuildId { get; set; }

    [JsonPropertyName("channels")]
    public List<ChannelInfo> Channels { get; set; }
}