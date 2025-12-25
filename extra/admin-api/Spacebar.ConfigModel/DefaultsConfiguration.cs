using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class DefaultsConfiguration
{
    [JsonPropertyName("guild")] public GuildDefaults Guild = new GuildDefaults();
    [JsonPropertyName("user")] public ChannelDefaults Channel = new ChannelDefaults();
}

public class GuildDefaults
{
    [JsonPropertyName("maxPresences")] public int MaxPresences { get; set; } = 250000;

    [JsonPropertyName("maxVideoChannelUsers")]
    public int MaxVideoChannelUsers { get; set; } = 200;

    [JsonPropertyName("afkTimeout")] public int AfkTimeout { get; set; } = 300;

    [JsonPropertyName("defaultMessageNotifications")]
    public int DefaultMessageNotifications { get; set; } = 1;

    [JsonPropertyName("explicitContentFilter")]
    public int ExplicitContentFilter { get; set; } = 0;
}

public class ChannelDefaults
{
    [JsonPropertyName("premium")]
    public bool Premium { get; set; } = true;

    [JsonPropertyName("premiumType")]
    public int PremiumType { get; set; } = 2;

    [JsonPropertyName("verified")]
    public bool Verified { get; set; } = true;
}