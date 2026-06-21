using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Transactions;

namespace Spacebar.Interop.Replication.Abstractions;

[JsonConverter(typeof(ReplicationMessageJsonConverter))]
public class ContentlessReplicationMessage {
    [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? ChannelId { get; set; }

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonPropertyName("user_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? UserId { get; set; }

    [JsonPropertyName("session_id")]
    public string? SessionId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("event")]
    public string Event { get; set; } = null!;

    [JsonPropertyName("origin")]
    public string? Origin { get; set; }

    [JsonPropertyName("reconnect_delay")]
    public int? ReconnectDelay { get; set; }
}

public class ReplicationMessage<TPayload> : ContentlessReplicationMessage {
    [JsonPropertyName("data")]
    public TPayload Payload { get; set; } = default!;
}

public class ReplicationMessageJsonConverter : JsonConverter<ContentlessReplicationMessage> {
    public override ContentlessReplicationMessage? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        // return JsonSerializer.Deserialize(ref reader, typeToConvert, options) as ContentlessReplicationMessage;
        Console.WriteLine("TODO: write ReplicationMessage deserialization"); //TODO
        return null;
    }

    public override void Write(Utf8JsonWriter writer, ContentlessReplicationMessage value, JsonSerializerOptions options) {
        writer.WriteStartObject();
        writer.WriteString("event", value.Event);
        if (value.ChannelId.HasValue) writer.WriteString("channel_id", value.ChannelId.ToString());
        if (value.GuildId.HasValue) writer.WriteString("guild_id", value.GuildId.ToString());
        if (value.UserId.HasValue) writer.WriteString("user_id", value.UserId.ToString());
        if (value.SessionId != null) writer.WriteString("session_id", value.SessionId);

        if (value.CreatedAt.HasValue) writer.WriteString("created_at", value.CreatedAt.Value.ToString("O"));
        if (value.Origin != null) writer.WriteString("origin", value.Origin);
        if (value.ReconnectDelay.HasValue) writer.WriteNumber("reconnect_delay", value.ReconnectDelay.Value);

        if (value.GetType().IsGenericType && value.GetType().GetGenericTypeDefinition() == typeof(ReplicationMessage<>)) {
            var dataType = value.GetType().GenericTypeArguments[0];
            
            var dataProperty = value.GetType().GetProperty("Payload", BindingFlags.Public | BindingFlags.Instance);
            var dataValue = dataProperty!.GetValue(value);
            
            writer.WritePropertyName("data");
            JsonSerializer.Serialize(writer, dataValue, dataType, options);
        }
        
        writer.WriteEndObject();
    }
}