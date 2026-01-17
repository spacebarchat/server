using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class LimitsConfiguration {
    [JsonPropertyName("user")]
    public UserLimits User { get; set; } = new UserLimits();

    [JsonPropertyName("guild")]
    public GuildLimits Guild { get; set; } = new GuildLimits();

    [JsonPropertyName("message")]
    public MessageLimits Message { get; set; } = new MessageLimits();

    [JsonPropertyName("channel")]
    public ChannelLimits Channel { get; set; } = new ChannelLimits();

    [JsonPropertyName("rate")]
    public RateLimits Rate { get; set; } = new RateLimits();

    [JsonPropertyName("absoluteRate")]
    public GlobalRateLimits AbsoluteRate { get; set; } = new GlobalRateLimits();
}

public class GlobalRateLimits {
    [JsonPropertyName("register")]
    public GlobalRateLimit Register { get; set; } = new() {
        Enabled = true,
        Count = 25,
        Window = 60 * 60 * 1000
    };

    [JsonPropertyName("sendMessage")]
    public GlobalRateLimit SendMessage { get; set; } = new() {
        Enabled = true,
        Count = 200,
        Window = 60 * 1000
    };

    public class GlobalRateLimit : RateLimits.RateLimitOptions {
        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; } = true;
    }
}

public class RateLimits {
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("ip")]
    public RateLimitOptions Ip { get; set; } = new RateLimitOptions() {
        Count = 500,
        Window = 5
    };

    [JsonPropertyName("global")]
    public RateLimitOptions Global { get; set; } = new RateLimitOptions() {
        Count = 250,
        Window = 5
    };

    [JsonPropertyName("error")]
    public RateLimitOptions Error { get; set; } = new RateLimitOptions() {
        Count = 50,
        Window = 5
    };

    [JsonPropertyName("routes")]
    public RouteRateLimits Routes { get; set; } = new RouteRateLimits();

    public class RouteRateLimits {
        [JsonPropertyName("guild")]
        public RateLimitOptions Guild { get; set; } = new RateLimitOptions() {
            Count = 5,
            Window = 5
        };

        [JsonPropertyName("webhook")]
        public RateLimitOptions Webhook { get; set; } = new RateLimitOptions() {
            Count = 10,
            Window = 5
        };

        [JsonPropertyName("channel")]
        public RateLimitOptions Channel { get; set; } = new RateLimitOptions() {
            Count = 10,
            Window = 5
        };

        [JsonPropertyName("auth")]
        public AuthRateLimits Auth { get; set; } = new AuthRateLimits();

        public class AuthRateLimits {
            [JsonPropertyName("login")]
            public RateLimitOptions Login { get; set; } = new RateLimitOptions() {
                Count = 5,
                Window = 60
            };

            [JsonPropertyName("register")]
            public RateLimitOptions Register { get; set; } = new RateLimitOptions() {
                Count = 2,
                Window = 60 * 60 * 12
            };
        }
    }

    public class RateLimitOptions {
        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("window")]
        public int Window { get; set; }

        [JsonIgnore]
        public TimeSpan WindowTimeSpan => TimeSpan.FromSeconds(Window);
    }
}

public class ChannelLimits {
    [JsonPropertyName("maxPins")]
    public int MaxPins { get; set; } = 500;

    [JsonPropertyName("maxTopic")]
    public int MaxTopic { get; set; } = 1024;

    [JsonPropertyName("maxWebhooks")]
    public int MaxWebhooks { get; set; } = 100;
}

public class MessageLimits {
    [JsonPropertyName("maxCharacters")]
    public int MaxCharacters { get; set; } = 1048576;

    [JsonPropertyName("maxTTSCharacters")]
    public int MaxTTSCharacters { get; set; } = 160;

    [JsonPropertyName("maxReactions")]
    public int MaxReactions { get; set; } = 2048;

    [JsonPropertyName("maxAttachmentSize")]
    public int MaxAttachmentSize { get; set; } = 1024 * 1024 * 1024;

    [JsonPropertyName("maxBulkDelete")]
    public int MaxBulkDelete { get; set; } = 1000;

    [JsonPropertyName("maxEmbedDownloadSize")]
    public int MaxEmbedDownloadSize { get; set; } = 1024 * 1024 * 1024;

    [JsonPropertyName("maxPreloadCount")]
    public int MaxPreloadCount { get; set; } = 100;
}

public class GuildLimits {
    [JsonPropertyName("maxRoles")]
    public int MaxRoles { get; set; } = 1000;

    [JsonPropertyName("maxEmojis")]
    public int MaxEmojis { get; set; } = 2000;

    [JsonPropertyName("maxStickers")]
    public int MaxStickers { get; set; } = 500;

    [JsonPropertyName("maxMembers")]
    public int MaxMembers { get; set; } = 25000000;

    [JsonPropertyName("maxChannels")]
    public int MaxChannels { get; set; } = 65535;

    [JsonPropertyName("maxBulkBanUsers")]
    public int MaxBulkBanUsers { get; set; } = 200;

    [JsonPropertyName("maxChannelsInCategory")]
    public int MaxChannelsInCategory { get; set; } = 65536;
}

public class UserLimits {
    [JsonPropertyName("maxGuilds")]
    public int MaxGuilds { get; set; } = 1048576;

    [JsonPropertyName("maxUsername")]
    public int MaxUsername { get; set; } = 32;

    [JsonPropertyName("maxFriends")]
    public int MaxFriends { get; set; } = 5000;

    [JsonPropertyName("maxBio")]
    public int MaxBio { get; set; } = 190;
}