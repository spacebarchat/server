using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

[DebuggerDisplay("{User.Id} ({User.Username}#{User.Discriminator})")]
[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
[JsonConverter(typeof(MemberJsonConverter))]
public class Member
{
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

    [JsonPropertyName("display_name_styles"), JsonIgnore(Condition = JsonIgnoreCondition.Never)]
    public DisplayNameStyle? DisplayNameStyles { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }

    [JsonPropertyName("roles"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public List<long>? Roles { get; set; }
}

// Unsure if this is used anywhere outside of op14...?
public class MemberWithPresence : Member
{
    [JsonPropertyName("presence")]
    public Presence? Presence { get; set; }
}

public class MemberJsonConverter : JsonConverter<Member>
{
    public override Member? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException(); // TODO
    }

    public override void Write(Utf8JsonWriter writer, Member value, JsonSerializerOptions options) => JsonSerializer.Serialize(writer, value, value.GetType(), options);
}