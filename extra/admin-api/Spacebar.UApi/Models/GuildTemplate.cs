using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.UApi.Models;

// TODO: real schemas
public class GuildTemplate {
    [JsonPropertyName("code")]
    public string Code { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("usage_count")]
    public int UsageCount { get; set; }

    [JsonPropertyName("creator_id")]
    public string CreatorId { get; set; }

    [JsonPropertyName("creator")]
    public JsonObject Creator { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    [JsonPropertyName("source_guild_id")]
    public string SourceGuildId { get; set; }

    [JsonPropertyName("serialized_source_guild")]
    public SerializedSourceGuild SerializedSourceGuild { get; set; }
}

public class SerializedSourceGuild { }

public class GuildTemplateRole {
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("permissions")]
    public string Permissions { get; set; }

    // "color" ignored for now - is deprecated anyhow
    [JsonPropertyName("colors")]
    public RoleColors Colors { get; set; }
    
    [JsonPropertyName("hoist")]
    public bool Hoist { get; set; }
    
    [JsonPropertyName("mentionable")]
    public bool Mentionable { get; set; }
    
    // [JsonPropertyName("icon")]
}

public class RoleColors {
    [JsonPropertyName("primary_color")]
    public int PrimaryColor { get; set; }

    [JsonPropertyName("secondary_color")]
    public int? SecondaryColor { get; set; }

    [JsonPropertyName("tertiary_color")]
    public int TertiaryColor { get; set; }
}