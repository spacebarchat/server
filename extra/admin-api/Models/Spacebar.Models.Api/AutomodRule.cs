using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "trigger_type", UnknownDerivedTypeHandling = JsonUnknownDerivedTypeHandling.FallBackToBaseType)]
[JsonDerivedType(typeof(Keyword), (int)AutomodTriggerType.Keyword)]
[JsonDerivedType(typeof(UserProfile), (int)AutomodTriggerType.UserProfile)]
[JsonDerivedType(typeof(KeywordPreset), (int)AutomodTriggerType.KeywordPreset)]
[JsonDerivedType(typeof(MentionSpam), (int)AutomodTriggerType.MentionSpam)]
// without metadata
[JsonDerivedType(typeof(HarmfulLink), (int)AutomodTriggerType.HarmfulLink)]
[JsonDerivedType(typeof(Spam), (int)AutomodTriggerType.Spam)]
[JsonDerivedType(typeof(GuildPolicy), (int)AutomodTriggerType.GuildPolicy)]
public class AutomodRuleCreateRequest {
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("event_type")]
    public AutomodEventType EventType { get; set; }

    [JsonPropertyName("actions")]
    public List<AutomodAction> Actions { get; set; }

    [JsonPropertyName("enabled"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? Enabled { get; set; }

    [JsonPropertyName("exempt_roles"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<long>? ExemptRoles { get; set; }

    [JsonPropertyName("exempt_channels"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<long>? ExemptChannels { get; set; }

#region Subclasses per type

    public class Keyword : AutomodRuleCreateRequest {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.KeywordTrigger TriggerMetadata { get; set; }
    }

    public class UserProfile : AutomodRuleCreateRequest {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.UserProfileTrigger TriggerMetadata { get; set; }
    }

    public class KeywordPreset : AutomodRuleCreateRequest {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.KeywordPresetTrigger TriggerMetadata { get; set; }
    }

    public class MentionSpam : AutomodRuleCreateRequest {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.MentionSpamTrigger TriggerMetadata { get; set; }
    }

    public class HarmfulLink : AutomodRuleCreateRequest {
        // does not have trigger_metadata definitions
    }

    public class Spam : AutomodRuleCreateRequest {
        // does not have trigger_metadata definitions
    }

    public class GuildPolicy : AutomodRuleCreateRequest {
        // does not have trigger_metadata definitions
    }

#endregion
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "trigger_type", UnknownDerivedTypeHandling = JsonUnknownDerivedTypeHandling.FallBackToBaseType)]
[JsonDerivedType(typeof(Keyword), (int)AutomodTriggerType.Keyword)]
[JsonDerivedType(typeof(UserProfile), (int)AutomodTriggerType.UserProfile)]
[JsonDerivedType(typeof(KeywordPreset), (int)AutomodTriggerType.KeywordPreset)]
[JsonDerivedType(typeof(MentionSpam), (int)AutomodTriggerType.MentionSpam)]
// without metadata
[JsonDerivedType(typeof(HarmfulLink), (int)AutomodTriggerType.HarmfulLink)]
[JsonDerivedType(typeof(Spam), (int)AutomodTriggerType.Spam)]
[JsonDerivedType(typeof(GuildPolicy), (int)AutomodTriggerType.GuildPolicy)]
public class AutomodRule {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long Id { get; set; }

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long GuildId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("creator_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long CreatorId { get; set; }

    [JsonPropertyName("event_type")]
    public AutomodEventType EventType { get; set; }

    [JsonPropertyName("actions")]
    public List<AutomodAction> Actions { get; set; }

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; }

    [JsonPropertyName("exempt_roles"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public List<long> ExemptRoles { get; set; }

    [JsonPropertyName("exempt_channels"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public List<long> ExemptChannels { get; set; }

#region Subclasses per type

    public class Keyword : AutomodRule {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.KeywordTrigger TriggerMetadata { get; set; }
    }

    public class UserProfile : AutomodRule {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.UserProfileTrigger TriggerMetadata { get; set; }
    }

    public class KeywordPreset : AutomodRule {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.KeywordPresetTrigger TriggerMetadata { get; set; }
    }

    public class MentionSpam : AutomodRule {
        [JsonPropertyName("trigger_metadata")]
        public AutomodTriggerMetadata.MentionSpamTrigger TriggerMetadata { get; set; }
    }

    public class HarmfulLink : AutomodRule {
        // does not have trigger_metadata definitions
    }

    public class Spam : AutomodRule {
        // does not have trigger_metadata definitions
    }

    public class GuildPolicy : AutomodRule {
        // does not have trigger_metadata definitions
    }

#endregion
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(BlockMessage), (int)AutomodActionType.BLOCK_MESSAGE)]
[JsonDerivedType(typeof(SendAlertMessage), (int)AutomodActionType.SEND_ALERT_MESSAGE)]
[JsonDerivedType(typeof(TimeoutUser), (int)AutomodActionType.TIMEOUT_USER)]
public abstract class AutomodAction {
    // cannot be combined with polymorphic deserialisation
    // [JsonPropertyName("type")]
    // public AutomodActionType Action { get; set; }

    public class BlockMessage : AutomodAction {
        [JsonPropertyName("metadata"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public MetadataContent? Metadata { get; set; }

        public class MetadataContent {
            [JsonPropertyName("custom_message")]
            public string? CustomMessage { get; set; }
        }
    }

    public class SendAlertMessage : AutomodAction {
        [JsonPropertyName("metadata"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public MetadataContent? Metadata { get; set; }

        public class MetadataContent {
            [JsonPropertyName("channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
            public long ChannelId { get; set; }
        }
    }

    public class TimeoutUser : AutomodAction {
        [JsonPropertyName("metadata"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public MetadataContent? Metadata { get; set; }

        public class MetadataContent {
            [JsonPropertyName("duration_seconds")]
            public int DurationSeconds { get; set; }
        }
    }
}

public enum AutomodActionType {
    BLOCK_MESSAGE = 1,
    SEND_ALERT_MESSAGE = 2,
    TIMEOUT_USER = 3,
    QUARANTINE_USER = 4
}

public interface AutomodTriggerMetadata {
    class KeywordTrigger : AutomodTriggerMetadata {
        [JsonPropertyName("keyword_filter")]
        public List<string> KeywordFilter { get; set; }

        [JsonPropertyName("regex_patterns")]
        public List<string> RegexPatterns { get; set; }

        [JsonPropertyName("allow_list")]
        public List<string> AllowList { get; set; }
    }

    class UserProfileTrigger : AutomodTriggerMetadata {
        [JsonPropertyName("keyword_filter")]
        public List<string> KeywordFilter { get; set; }

        [JsonPropertyName("regex_patterns")]
        public List<string> RegexPatterns { get; set; }

        [JsonPropertyName("allow_list")]
        public List<string> AllowList { get; set; }
    }

    class KeywordPresetTrigger : AutomodTriggerMetadata {
        [JsonPropertyName("presets")]
        public List<PresetTypes> Presets { get; set; }

        [JsonPropertyName("allow_list")]
        public List<string> AllowList { get; set; }

        public enum PresetTypes : byte {
            Profanity = 1,
            SexualContent = 2,
            Slurs = 3
        }
    }

    class MentionSpamTrigger : AutomodTriggerMetadata {
        [JsonPropertyName("mention_total_limit")]
        public int MentionTotalLimit { get; set; }

        [JsonPropertyName("mention_raid_protection_enabled")]
        public bool MentionRaidProtectionEnabled { get; set; }
    }
}

public enum AutomodEventType {
    MessageSend = 1,
    GuildMemberEvent = 2,
}

public enum AutomodTriggerType {
    Keyword = 1,
    HarmfulLink = 2,
    Spam = 3,
    KeywordPreset = 4,
    MentionSpam = 5,
    UserProfile = 6,
    GuildPolicy = 7
}