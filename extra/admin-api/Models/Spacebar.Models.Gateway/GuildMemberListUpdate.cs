using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

public class GuildMemberListUpdate {
    [JsonPropertyName("id")]
    public string ListId { get; set; } = null!;

    [JsonPropertyName("guild_id")]
    public string GuildId { get; set; } = null!;

    [JsonPropertyName("online_count")]
    public int OnlineCount { get; set; }

    [JsonPropertyName("member_count")]
    public int MemberCount { get; set; }

    [JsonPropertyName("ops")]
    public List<BaseGuildMemberListUpdateOperation> Operations { get; set; } = null!;

    [JsonPropertyName("groups")]
    public List<GuildMemberListGroupCount> Groups { get; set; } = null!;
}

// i cba to write a dictionary converter for this...
public class GuildMemberListGroupCount {
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

public enum GuildMemberListUpdateOperationType {
    [JsonStringEnumMemberName("sync")] Sync = 0,
    [JsonStringEnumMemberName("insert")] Insert = 1,
    [JsonStringEnumMemberName("update")] Update = 2,
    [JsonStringEnumMemberName("delete")] Delete = 3,

    [JsonStringEnumMemberName("invalidate")]
    Invalidate = 4
}

#region Operations

public class BaseGuildMemberListUpdateOperation {
    [JsonPropertyName("op")]
    public GuildMemberListUpdateOperationType Operation { get; set; }
}

public class GuildMemberListSyncOperation : BaseGuildMemberListUpdateOperation {
    [JsonPropertyName("range")]
    public int[] Range { get; set; } = null!;

    [JsonPropertyName("items")]
    public List<GuildMemberListSyncItem> Items { get; set; } = null!;
}

public class GuildMemberListSyncItem {
    public class GuildMemberListMemberSyncItem : GuildMemberListSyncItem {
        [JsonPropertyName("member")]
        public Member Member { get; set; } = null!;
    }
}

#endregion

// TODO: diff algo
// TODO: snapshots