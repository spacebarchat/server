using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Nodes;
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
    public JsonObject? AvatarDecorationData { get; set; }

    [JsonPropertyName("collectibles")]
    public JsonObject? Collectibles { get; set; }

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
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        using var document = JsonDocument.ParseValue(ref reader);
        var jsonObject = document.RootElement;
        if (jsonObject.ValueKind != JsonValueKind.Object)
            throw new JsonException("Expected member payload to be a JSON object.");

        var hasPresence = jsonObject.TryGetProperty("presence", out _);
        Member member = hasPresence
            ? new MemberWithPresence { User = null! }
            : new Member { User = null! };
        var hasUser = false;

        foreach (var property in jsonObject.EnumerateObject())
        {
            switch (property.Name)
            {
                case "user":
                    member.User = property.Value.Deserialize<PartialUser>(options) ?? throw new JsonException("The required member user field is invalid.");
                    hasUser = true;

                    break;
                case "nick":
                    member.Nick = property.Value.ValueKind == JsonValueKind.Null ? null : property.Value.GetString();
                    break;
                case "avatar":
                    member.Avatar = property.Value.ValueKind == JsonValueKind.Null ? null : property.Value.GetString();
                    break;
                case "avatar_decoration_data":
                    member.AvatarDecorationData = property.Value.ValueKind == JsonValueKind.Null ? null : JsonNode.Parse(property.Value.GetRawText()) as JsonObject;
                    break;
                case "collectibles":
                    member.Collectibles = property.Value.ValueKind == JsonValueKind.Null ? null : JsonNode.Parse(property.Value.GetRawText()) as JsonObject;
                    break;
                case "display_name_styles":
                    if (property.Value.ValueKind != JsonValueKind.Null)
                        member.DisplayNameStyles = property.Value.Deserialize<DisplayNameStyle>(options);
                    break;
                case "banner":
                    member.Banner = property.Value.ValueKind == JsonValueKind.Null ? null : property.Value.GetString();
                    break;
                case "bio":
                    member.Bio = property.Value.ValueKind == JsonValueKind.Null ? null : property.Value.GetString();
                    break;
                case "roles":
                    if (property.Value.ValueKind == JsonValueKind.Null)
                    {
                        member.Roles = null;
                        break;
                    }

                    if (property.Value.ValueKind != JsonValueKind.Array)
                        throw new JsonException("Expected roles to be an array.");

                    member.Roles = new List<long>();
                    foreach (var role in property.Value.EnumerateArray())
                    {
                        switch (role.ValueKind)
                        {
                            case JsonValueKind.Number:
                                member.Roles.Add(role.GetInt64());
                                break;
                            case JsonValueKind.String:
                                if (!long.TryParse(role.GetString(), out var roleId))
                                    throw new JsonException("Invalid role id.");
                                member.Roles.Add(roleId);
                                break;
                            default:
                                throw new JsonException("Invalid role id value kind.");
                        }
                    }

                    break;
                case "presence":
                    if (member is MemberWithPresence memberWithPresence && property.Value.ValueKind != JsonValueKind.Null)
                        memberWithPresence.Presence = property.Value.Deserialize<Presence>(options);
                    break;
            }
        }

        if (!hasUser)
            throw new JsonException("The required member user field is missing.");

        return member;
    }

    public override void Write(Utf8JsonWriter writer, Member value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        {
            writer.WritePropertyName("user");
            JsonSerializer.Serialize(writer, value.User);

            if (value.Nick != null) writer.WriteString("nick", value.Nick);
            if (value.Avatar != null) writer.WriteString("avatar", value.Avatar);

            if (value.AvatarDecorationData != null)
            {
                writer.WritePropertyName("avatar_decoration_data");
                JsonSerializer.Serialize(writer, value.AvatarDecorationData);
            }

            if (value.Collectibles != null)
            {
                writer.WritePropertyName("collectibles");
                JsonSerializer.Serialize(writer, value.Collectibles);
            }

            writer.WritePropertyName("display_name_styles");
            if (value.DisplayNameStyles != null)
            {
                JsonSerializer.Serialize(writer, value.DisplayNameStyles);
            }
            else writer.WriteNullValue();

            if (value.Banner != null) writer.WriteString("banner", value.Banner);
            if (value.Bio != null) writer.WriteString("bio", value.Bio);

            if (value.Roles != null)
            {
                writer.WritePropertyName("roles");
                JsonSerializer.Serialize(writer, value.Roles);
            }

            if (value is MemberWithPresence mwp && mwp.Presence != null)
            {
                writer.WritePropertyName("presence");
                JsonSerializer.Serialize(writer, mwp.Presence);
            }
        }
        writer.WriteEndObject();
    }
}