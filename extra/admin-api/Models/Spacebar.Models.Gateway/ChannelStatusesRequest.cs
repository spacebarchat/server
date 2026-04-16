using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class ChannelStatusesRequest {
    [JsonRequired]
    [JsonPropertyName("guild_id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]

    public JsonValue GuildIdRawValue { get; set; } = null!;

    [JsonIgnore]
    public long? GuildId {
        get => GuildIdRawValue.GetValueKind() == JsonValueKind.String ? GuildIdRawValue.GetValue<long>() : null;
        [MemberNotNull] set => GuildIdRawValue = JsonValue.Create(value!);
    }

    [JsonIgnore]
    public List<long>? GuildIds {
        get => GuildIdRawValue.GetValueKind() == JsonValueKind.Array ? GuildIdRawValue.AsArray().Deserialize<List<long>>() : null;
        [MemberNotNull] set => GuildIdRawValue = JsonValue.Create(value!)!;
    }
}

public class ChannelInfoRequest : ChannelStatusesRequest {
    [JsonPropertyName("fields")]
    public required List<string> Fields { get; set; }
}

public class ChannelStatus {
    [JsonPropertyName("id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long ChannelId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }
}

public class ChannelStatusesResponse {
    [JsonPropertyName("guild_id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long GuildId { get; set; }

    [JsonPropertyName("channels")]
    public List<ChannelStatus> Channels { get; set; }
}

public class ChannelInfo {
    [JsonPropertyName("id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long ChannelId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("voice_start_time")]
    public DateTimeOffset? VoiceStartTime { get; set; }
}

public class ChannelInfoResponse {
    [JsonPropertyName("guild_id")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long GuildId { get; set; }

    [JsonPropertyName("channels")]
    public List<ChannelInfo> Channels { get; set; }
}