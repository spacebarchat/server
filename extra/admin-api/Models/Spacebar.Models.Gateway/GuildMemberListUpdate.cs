using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

public class GuildMemberListUpdate
{
    public const string EventId = "GUILD_MEMBER_LIST_UPDATE";

    [JsonPropertyName("id")]
    public string ListId { get; set; } = null!;

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long GuildId { get; set; }

    [JsonPropertyName("online_count")]
    public int OnlineCount { get; set; }

    [JsonPropertyName("member_count")]
    public int MemberCount { get; set; }

    [JsonPropertyName("ops")]
    public List<GuildMemberListUpdateOperation> Operations { get; set; } = null!;

    [JsonPropertyName("groups")]
    public List<GuildMemberListSyncItem.RoleEntry.Content> Groups { get; set; } = null!;
}

// i cba to write a dictionary converter for this...
public class GuildMemberListGroupCount
{
    /// <summary>
    ///     Role ID, "online" or "offline"
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("count")]
    public int Count { get; set; }

    public static implicit operator KeyValuePair<string, int>(GuildMemberListGroupCount groupCount) => new(groupCount.Id, groupCount.Count);
    public static implicit operator GuildMemberListGroupCount(KeyValuePair<string, int> kvp) => new() { Id = kvp.Key, Count = kvp.Value };
}

[JsonConverter(typeof(JsonStringEnumConverter<GuildMemberListUpdateOperationType>))]
public enum GuildMemberListUpdateOperationType
{
    [JsonStringEnumMemberName("SYNC")] Sync = 0,
    [JsonStringEnumMemberName("INSERT")] Insert = 1,
    [JsonStringEnumMemberName("UPDATE")] Update = 2,
    [JsonStringEnumMemberName("DELETE")] Delete = 3,

    [JsonStringEnumMemberName("INVALIDATE")]
    Invalidate = 4
}

#region Operations

[JsonConverter(typeof(GuildMemberListUpdateOperationJsonConverter))]
public class GuildMemberListUpdateOperation
{
    [JsonPropertyName("op")]
    public GuildMemberListUpdateOperationType Operation { get; set; }

    public class SyncOperation : GuildMemberListUpdateOperation
    {
        [JsonPropertyName("range")]
        public int[] Range { get; set; } = null!;

        [JsonPropertyName("items")]
        public List<GuildMemberListSyncItem> Items { get; set; } = null!;
    }
}

[JsonConverter(typeof(GuildMemberListSyncItemJsonConverter))]
public class GuildMemberListSyncItem
{
    public class RoleEntry : GuildMemberListSyncItem
    {
        [JsonPropertyName("group")]
        public Content Group { get; set; }

        public class Content
        {
            [JsonPropertyName("id")]
            public string Id { get; set; }

            [JsonPropertyName("count")]
            public long Count { get; set; }
        }
    }

    public class MemberEntry : GuildMemberListSyncItem
    {
        [JsonPropertyName("member")]
        public Member Member { get; set; } = null!;
    }
}

public class GuildMemberListSyncItemJsonConverter : JsonConverter<GuildMemberListSyncItem>
{
    public override GuildMemberListSyncItem? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var n = JsonSerializer.Deserialize<JsonObject>(ref reader, options);
        if (n.ContainsKey("group")) return n.Deserialize<GuildMemberListSyncItem.RoleEntry>();
        if (n.ContainsKey("member")) return n.Deserialize<GuildMemberListSyncItem>();
        throw new InvalidOperationException("Could not determine sync item type for keys " + string.Join(", ", n.Select(x => x.Key)));
    }

    public override void Write(Utf8JsonWriter writer, GuildMemberListSyncItem value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
}

public class GuildMemberListUpdateOperationJsonConverter : JsonConverter<GuildMemberListUpdateOperation>
{
    public override GuildMemberListUpdateOperation? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var n = JsonSerializer.Deserialize<JsonObject>(ref reader, options);
        return n!["op"]!.GetValue<string>() switch
        {
            "SYNC" => n.Deserialize<GuildMemberListUpdateOperation.SyncOperation>(),
            _ => throw new InvalidCastException("Unknown operation: " + n["op"]!.GetValue<string>())
        };
    }

    public override void Write(Utf8JsonWriter writer, GuildMemberListUpdateOperation value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
}

#endregion

// TODO: diff algo
// TODO: snapshots