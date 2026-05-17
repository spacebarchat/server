using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class Channel {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
    
    [JsonPropertyName("default_thread_rate_limit_per_user")]
    public int DefaultThreadRateLimitPerUser { get; set; }
    
    [JsonPropertyName("flags")]
    public int Flags { get; set; } //TODO: enum
    
    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }
    
    [JsonPropertyName("icon")]
    public string? Icon { get; set; }
    
    [JsonPropertyName("last_message_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? LastMessageId { get; set; }
    
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    
    [JsonPropertyName("nsfw")]
    public bool Nsfw { get; set; }
    
    [JsonPropertyName("parent_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ParentId { get; set; }

    [JsonPropertyName("permission_overwrites")]
    public List<ChannelPermissionOverwrite> PermissionOverwrites { get; set; }
    
    [JsonPropertyName("position")]
    public int Position { get; set; }
    
    [JsonPropertyName("status")]
    public string? Status { get; set; }
    
    [JsonPropertyName("topic")]
    public string? Topic { get; set; }
    
    [JsonPropertyName("type")]
    public int Type { get; set; } //TODO enum
    
    [JsonPropertyName("video_quality_mode")]
    public object? VideoQualityMode { get; set; }
}

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