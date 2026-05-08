using System.Text.Json.Serialization;
using Spacebar.Models.Generic.Constants;

namespace Spacebar.Models.Generic;

public class Role {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("color"), Obsolete("See Colors instead")]
    public int Color { get; set; }

    [JsonPropertyName("colors")]
    public RoleColors Colors { get; set; }

    [JsonPropertyName("flags")]
    public int Flags { get; set; }

    [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long GuildId { get; set; }

    [JsonPropertyName("hoist")]
    public bool Hoist { get; set; }

    [JsonPropertyName("icon")]
    public string Icon { get; set; }

    [JsonPropertyName("managed")]
    public bool Managed { get; set; }

    [JsonPropertyName("mentionable")]
    public bool Mentionable { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("permissions"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required ulong RawPermissions { get; set; }

    [JsonIgnore]
    public Permissions Permissions {
        get => (Permissions)RawPermissions;
        set => RawPermissions = (ulong)value;
    }

    [JsonPropertyName("position")]
    public int Position { get; set; }

    [JsonPropertyName("unicode_emoji")]
    public string UnicodeEmoji { get; set; }

    public class RoleColors {
        [JsonPropertyName("primary_color")]
        public required int PrimaryColor { get; set; }

        [JsonPropertyName("secondary_color")]
        public int? SecondaryColor { get; set; }

        [JsonPropertyName("tertiary_color")]
        public int? TertiaryColor { get; set; }
    }
}