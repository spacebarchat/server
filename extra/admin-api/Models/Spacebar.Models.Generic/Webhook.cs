using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class Webhook {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("type")]
    public WebhookType WebhookType { get; set; }

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ChannelId { get; set; }

    [JsonPropertyName("user")]
    public PartialUser? User { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("avatar")]
    public string? AvatarData { get; set; }

    [JsonPropertyName("token")]
    public string? Token { get; set; }

    [JsonPropertyName("application_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ApplicationId { get; set; }

    [JsonPropertyName("source_guild")]
    public JsonObject? SourceGuild { get; set; } // TODO type

    [JsonPropertyName("source_channel")]
    public JsonObject? SourceChannel { get; set; } // TODO type

    [JsonPropertyName("url")]
    public string? Url { get; set; }
}

public enum WebhookType : byte {
    Incomming = 1,
    ChannelFollower = 2,
    Application = 3
}