using System.Diagnostics;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

[DebuggerDisplay("{Id} ({Username}#{Discriminator})")]
public class PartialUser {
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("username")]
    public string Username { get; set; }

    [JsonPropertyName("discriminator")]
    public string Discriminator { get; set; }

    [JsonPropertyName("global_name")]
    public string? GlobalName { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("avatar_decoration_data")]
    public object? AvatarDecorationData { get; set; }

    [JsonPropertyName("collectibles")]
    public object? Collectibles { get; set; }

    [JsonPropertyName("display_name_styles")]
    public object? DisplayNameStyles { get; set; }

    [JsonPropertyName("primary_guild")]
    public object? PrimaryGuild { get; set; }

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