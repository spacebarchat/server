using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class CreateGuildRequest {
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("region")]
    public string? Region { get; set; } // deprecated?

    [JsonPropertyName("icon")]
    public string? IconData { get; set; }

    [JsonPropertyName("verification_level")]
    public int? VerificationLevel { get; set; } // TODO enum

    [JsonPropertyName("default_message_notifications")]
    public int? DefaultMessageNotifications { get; set; } // TODO enum

    [JsonPropertyName("explicit_content_filter")]
    public int? ExplicitContentFilter { get; set; } // TODO enum

    [JsonPropertyName("preferred_locale")]
    public string? PreferredLocale { get; set; }

    [JsonPropertyName("roles")]
    public List<JsonObject> Roles { get; set; } // TODO type

    [JsonPropertyName("channels")]
    public List<JsonObject> Channels { get; set; } // TODO type

    [JsonPropertyName("afk_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? AfkChannelId { get; set; }

    [JsonPropertyName("afk_timeout")]
    public int? AfkTimeout { get; set; }

    [JsonPropertyName("system_channel_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? SystemChannelId { get; set; }

    [JsonPropertyName("system_channel_flags")]
    public int? SystemChannelFlags { get; set; } // TODO enum

    [JsonPropertyName("guild_template_code")]
    public string? GuildTemplateCode { get; set; }

    [JsonPropertyName("staff_only")]
    public bool? StaffOnly { get; set; }
}