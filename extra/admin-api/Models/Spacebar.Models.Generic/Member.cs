using System.Diagnostics;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

[DebuggerDisplay("{User.Id} ({User.Username}#{User.Discriminator})")]
public class Member {
    [JsonPropertyName("user")]
    public required PartialUser User { get; set; }

    [JsonPropertyName("nick")]
    public string? Nick { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("avatar_decoration_data")]
    public object? AvatarDecorationData { get; set; }

    [JsonPropertyName("collectibles")]
    public object? Collectibles { get; set; }

    [JsonPropertyName("display_name_styles")]
    public object? DisplayNameStyles { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }
}