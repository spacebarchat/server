using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

[DebuggerDisplay("{Id} ({Username}#{Discriminator})")]
public class PartialUser
{
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("username")]
    public string Username { get; set; }

    [JsonPropertyName("discriminator")]
    public string Discriminator { get; set; }

    [JsonPropertyName("global_name")]
    public string? GlobalName { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("avatar_decoration_data")]
    public JsonObject? AvatarDecorationData { get; set; }

    [JsonPropertyName("collectibles")]
    public JsonObject? Collectibles { get; set; }

    [JsonPropertyName("display_name_styles"), JsonIgnore(Condition = JsonIgnoreCondition.Never)]
    public DisplayNameStyle? DisplayNameStyles { get; set; }

    [JsonPropertyName("primary_guild")]
    public JsonObject? PrimaryGuild { get; set; }

    [JsonPropertyName("bot")]
    public bool? Bot { get; set; }

    [JsonPropertyName("system")]
    public bool? System { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("accent_color")]
    public int? AccentColor { get; set; }

    [JsonPropertyName("public_flags")]
    public ulong? PublicFlags { get; set; }
}

public class DisplayNameStyle
{
    [JsonPropertyName("font_id")]
    public Font FontId { get; set; } = Font.Default;

    [JsonPropertyName("effect_id")]
    public Effect EffectId { get; set; } = Effect.Solid;

    [JsonPropertyName("colors"), MaxLength(2)]
    public List<int> Colors { get; set; } = [];

    // https://docs.discord.food/resources/user#display-name-font - unsure if these are just really close or directly used by discord while being renamed...
    public enum Font
    {
        Bangers = 1,
        BioRhyme = 2,
        CherryBomb = 3,
        Chicle = 4,
        Compagnon = 5,
        MuseoModerno = 6,
        NeoCastel = 7,
        Pixelify = 8,
        Ribes = 9,
        Sinistre = 10,
        Default = 11,
        ZillaSlab = 12
    }

    public enum Effect
    {
        Solid = 1,
        Gradient = 2,
        Neon = 3,
        Toon = 4,
        Pop = 5, 
        Glow = 6
    }
}