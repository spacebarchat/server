using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class Message {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ChannelId { get; set; }

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonPropertyName("webhook_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? WebhookId { get; set; }

    [JsonPropertyName("application_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ApplicationId { get; set; }

    [JsonPropertyName("content")]
    public string? Content { get; set; }

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }

    [JsonPropertyName("edited_timestamp")]
    public DateTime? EditedTimestamp { get; set; }

    [JsonPropertyName("tts")]
    public bool? Tts { get; set; }

    [JsonPropertyName("mention_everyone")]
    public bool? MentionEveryone { get; set; }

    [JsonPropertyName("mentions")]
    public List<PartialUser>? Mentions { get; set; }

    [JsonPropertyName("embeds")]
    public JsonObject[] Embeds { get; set; }

    [JsonPropertyName("reactions")]
    public JsonObject[] Reactions { get; set; } = null!;

    [JsonPropertyName("nonce")]
    public string? Nonce { get; set; }

    [JsonPropertyName("type")]
    public int Type { get; set; }

    [JsonPropertyName("activity")]
    public string? Activity { get; set; }

    [JsonPropertyName("message_reference")]
    public MessageReference? MessageReference { get; set; }

    [JsonPropertyName("referenced_message")]
    public Message? ReferencedMessage { get; set; }

    [JsonPropertyName("interaction")]
    public string? Interaction { get; set; }

    [JsonPropertyName("components")]
    public JsonObject[] Components { get; set; }

    [JsonPropertyName("flags")]
    public int Flags { get; set; }

    [JsonPropertyName("poll")]
    public string? Poll { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("pinned_at")]
    public DateTime? PinnedAt { get; set; }

    [JsonPropertyName("interaction_metadata")]
    public JsonObject? InteractionMetadata { get; set; }

    [JsonPropertyName("message_snapshots")]
    public JsonObject[]? MessageSnapshots { get; set; }

    [JsonPropertyName("thread_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ThreadId { get; set; }

    [JsonPropertyName("author")]
    public PartialUser Author { get; set; }

    [JsonPropertyName("attachments")]
    public List<MessageAttachment> Attachments { get; set; }
}

public class MessageReference {
    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long ChannelId { get; set; }

    [JsonPropertyName("message_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long MessageId { get; set; }
}

public class MessageAttachment {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long Id { get; set; }

    [JsonPropertyName("filename")]
    public string Filename { get; set; }

    [JsonPropertyName("size")]
    public int Size { get; set; }

    [JsonPropertyName("height")]
    public int? Height { get; set; }
    [JsonPropertyName("width")]
    public int? Width { get; set; }
    
    [JsonPropertyName("content_type")]
    public string ContentType { get; set; }
    
    // channel id? message id? are these leaked properties?
    [JsonPropertyName("url")]
    public string Url { get; set; }
    
    [JsonPropertyName("proxy_url")]
    public string ProxyUrl { get; set; }
}