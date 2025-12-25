using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class LimitsConfiguration {
    [JsonPropertyName("user")] public UserLimits User = new UserLimits();
    [JsonPropertyName("guild")] public GuildLimits Guild = new GuildLimits();
    [JsonPropertyName("message")] public MessageLimits Message = new MessageLimits();
    [JsonPropertyName("channel")] public ChannelLimits Channel = new ChannelLimits();
    [JsonPropertyName("rate")] public RateLimits Rate = new RateLimits();
    [JsonPropertyName("absoluteRate")] public GlobalRateLimits AbsoluteRate = new GlobalRateLimits();
}