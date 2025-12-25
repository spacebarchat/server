using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class ServerConfiguration {
    [JsonPropertyName("admin")]
    public EndpointConfiguration Admin { get; set; } = new();

    [JsonPropertyName("gateway")]
    public EndpointConfiguration Gateway { get; set; } = new();

    [JsonPropertyName("cdn")]
    public CdnConfiguration Cdn { get; set; } = new();

    [JsonPropertyName("api")]
    public ApiConfiguration Api { get; set; } = new();

    [JsonPropertyName("general")]
    public GeneralConfiguration General { get; set; } = new();

    [JsonPropertyName("limits")]
    public LimitsConfiguration Limits { get; set; } = new();

    [JsonPropertyName("security")]
    public SecurityConfiguration Security { get; set; } = new();

    [JsonPropertyName("login")]
    public LoginConfiguration Login { get; set; } = new();

    [JsonPropertyName("register")]
    public RegisterConfiguration Register { get; set; } = new RegisterConfiguration();

    [JsonPropertyName("regions")]
    public RegionConfiguration Regions { get; set; } = new();

    [JsonPropertyName("guild")]
    public GuildConfiguration Guild { get; set; } = new();

    [JsonPropertyName("gif")]
    public GifConfiguration Gif { get; set; } = new GifConfiguration();

    [JsonPropertyName("rabbitmq")]
    public RabbitMQConfiguration Rabbitmq { get; set; } = new RabbitMQConfiguration();

    [JsonPropertyName("templates")]
    public TemplateConfiguration Templates { get; set; } = new TemplateConfiguration();

    [JsonPropertyName("defaults")]
    public DefaultsConfiguration Defaults { get; set; } = new();

    [JsonPropertyName("external")]
    public ExternalTokensConfiguration External { get; set; } = new();

    // TODO: lazy
    // [JsonPropertyName("email")]
    // public EmailConfiguration Email { get; set; } = new EmailConfiguration();

    [JsonPropertyName("passwordReset")]
    public PasswordResetConfiguration PasswordReset { get; set; } = new PasswordResetConfiguration();

    [JsonPropertyName("user")]
    public UserConfiguration User { get; set; } = new UserConfiguration();
}

public class RegisterConfiguration {
    [JsonPropertyName("email")]
    public RegistrationEmailConfiguration Email { get; set; } = new RegistrationEmailConfiguration();

    [JsonPropertyName("dateOfBirth")]
    public DateOfBirthConfiguration DateOfBirth { get; set; } = new DateOfBirthConfiguration();

    [JsonPropertyName("password")]
    public PasswordConfiguration Password { get; set; } = new PasswordConfiguration();

    [JsonPropertyName("disabled")]
    public bool Disabled { get; set; } = false;

    [JsonPropertyName("requireCaptcha")]
    public bool RequireCaptcha { get; set; } = true;

    [JsonPropertyName("requireInvite")]
    public bool RequireInvite { get; set; } = false;

    [JsonPropertyName("guestsRequireInvite")]
    public bool GuestsRequireInvite { get; set; } = true;

    [JsonPropertyName("allowNewRegistration")]
    public bool AllowNewRegistration { get; set; } = true;

    [JsonPropertyName("allowMultipleAccounts")]
    public bool AllowMultipleAccounts { get; set; } = true;

    [JsonPropertyName("blockIpDataCoThreatTypes")]
    public List<string> BlockIpDataCoThreatTypes { get; set; } = [
        "tor", "icloud_relay", "proxy", "datacenter", "anonymous", "known_attacker", "known_abuser", "threat"
    ]; // matching ipdata's threat.is_* fields as of 2025/11/30, minus bogon

    [JsonPropertyName("blockAsnTypes")]
    public List<string> BlockAsnTypes { get; set; } = [""];

    [JsonPropertyName("blockAsns")]
    public List<string> BlockAsns { get; set; } = [""];

    [JsonPropertyName("blockAbuseIpDbAboveScore")]
    public int BlockAbuseIpDbAboveScore { get; set; } = 75; // 0 to disable

    [JsonPropertyName("incrementingDiscriminators")]
    public bool IncrementingDiscriminators { get; set; } = false; // random otherwise

    [JsonPropertyName("defaultRights")]
    public string DefaultRights { get; set; } = "875069521787904"; // See `npm run generate:rights`

    [JsonPropertyName("checkIp")]
    public bool CheckIp { get; set; } = true;
}

public class PasswordConfiguration {
    [JsonPropertyName("required")]
    public bool Required { get; set; } = true;

    [JsonPropertyName("minLength")]
    public int MinLength { get; set; } = 8;

    [JsonPropertyName("minNumbers")]
    public int MinNumbers { get; set; } = 2;

    [JsonPropertyName("minUpperCase")]
    public int MinUpperCase { get; set; } = 2;

    [JsonPropertyName("minSymbols")]
    public int MinSymbols { get; set; } = 0;
}

public class DateOfBirthConfiguration {
    [JsonPropertyName("required")]
    public bool Required { get; set; } = true;

    [JsonPropertyName("minimum")]
    public int Minimum { get; set; } = 13;
}

public class RegistrationEmailConfiguration {
    [JsonPropertyName("required")]
    public bool Required { get; set; } = false;

    [JsonPropertyName("allowlist")]
    public bool Allowlist { get; set; } = false;

    [JsonPropertyName("blocklist")]
    public bool Blocklist { get; set; } = false;

    [JsonPropertyName("domains")]
    public List<string> Domains { get; set; } = [];
}

public class TemplateConfiguration {
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("allowTemplateCreation")]
    public bool AllowTemplateCreation { get; set; } = true;

    [JsonPropertyName("allowDiscordTemplates")]
    public bool AllowDiscordTemplates { get; set; } = true;

    [JsonPropertyName("allowRaws")]
    public bool AllowRaws { get; set; } = true;
}

public class PasswordResetConfiguration {
    [JsonPropertyName("requireCaptcha")]
    public bool RequireCaptcha { get; set; } = false;
}

public class UserConfiguration {
    [JsonPropertyName("blockedContains")]
    public List<string> BlockedContains { get; set; } = [];

    [JsonPropertyName("blockedEquals")]
    public List<string> BlockedEquals { get; set; } = [];
}

public class RabbitMQConfiguration {
    [JsonPropertyName("host")]
    public string? Host { get; set; } = null;
}

public class GifConfiguration {
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("provider")]
    public string Provider { get; set; } = "tenor";

    [JsonPropertyName("apiKey")]
    public string? ApiKey { get; set; } = "LIVDSRZULELA";
}

public class EndpointConfiguration {
    [JsonPropertyName("endpointPrivate")]
    public string? EndpointPrivate { get; set; }

    [JsonPropertyName("endpointPublic")]
    public string? EndpointPublic { get; set; }
}

public class ApiConfiguration : EndpointConfiguration {
    [JsonPropertyName("activeVersions")]
    public List<string> ActiveVersions { get; set; } = null!;

    [JsonPropertyName("defaultVersion")]
    public string DefaultVersion { get; set; } = null!;
}

public class CdnConfiguration : EndpointConfiguration {
    [JsonPropertyName("resizeHeightMax")]
    public int ResizeHeightMax { get; set; } = 1000;

    [JsonPropertyName("resizeWidthMax")]
    public int ResizeWidthMax { get; set; } = 1000;

    [JsonPropertyName("imagorServerUrl")]
    public string? ImagorServerUrl { get; set; } = null;

    [JsonPropertyName("proxyCacheHeaderSeconds")]
    public int ProxyCacheHeaderSeconds { get; set; } = 60 * 60 * 24;

    [JsonPropertyName("maxAttachmentSize")]
    public int MaxAttachmentSize { get; set; } = 25 * 1024 * 1024; // 25 MB

    // limits: CdnLimitsConfiguration {get;set;}=new CdnLimitsConfiguration();
}

public class CdnLimitsConfiguration {
    [JsonPropertyName("icon")]
    public CdnImageLimitsConfiguration Icon { get; set; } = new();

    [JsonPropertyName("roleIcon")]
    public CdnImageLimitsConfiguration RoleIcon { get; set; } = new();

    [JsonPropertyName("emoji")]
    public CdnImageLimitsConfiguration Emoji { get; set; } = new();

    [JsonPropertyName("sticker")]
    public CdnImageLimitsConfiguration Sticker { get; set; } = new();

    [JsonPropertyName("banner")]
    public CdnImageLimitsConfiguration Banner { get; set; } = new();

    [JsonPropertyName("splash")]
    public CdnImageLimitsConfiguration Splash { get; set; } = new();

    [JsonPropertyName("avatar")]
    public CdnImageLimitsConfiguration Avatar { get; set; } = new();

    [JsonPropertyName("discoverySplash")]
    public CdnImageLimitsConfiguration DiscoverySplash { get; set; } = new();

    [JsonPropertyName("appIcon")]
    public CdnImageLimitsConfiguration AppIcon { get; set; } = new();

    [JsonPropertyName("discoverSplash")]
    public CdnImageLimitsConfiguration DiscoverSplash { get; set; } = new(); //what even is this?

    [JsonPropertyName("teamIcon")]
    public CdnImageLimitsConfiguration TeamIcon { get; set; } = new();

    [JsonPropertyName("channelIcon")]
    public CdnImageLimitsConfiguration ChannelIcon { get; set; } = new(); // is this even used?

    [JsonPropertyName("guildAvatar")]
    public CdnImageLimitsConfiguration GuildAvatar { get; set; } = new();
}

public class CdnImageLimitsConfiguration {
    [JsonPropertyName("maxHeight")]
    public int MaxHeight { get; set; } = 8192;

    [JsonPropertyName("maxWidth")]
    public int MaxWidth { get; set; } = 8192;

    [JsonPropertyName("maxSize")]
    public int MaxSize { get; set; } = 10 * 1024 * 1024; // 10 MB

    // "always" | "never" | "premium"
    [JsonPropertyName("allowAnimated")]
    public string AllowAnimated { get; set; } = "always";
}

public class LoginConfiguration {
    [JsonPropertyName("requireCaptcha")]
    public bool RequireCaptcha { get; set; } = false;

    [JsonPropertyName("requireVerification")]
    public bool RequireVerification { get; set; } = false;
}

public class RegionConfiguration {
    [JsonPropertyName("default")]
    public string Default { get; set; } = "spacebar-central";

    [JsonPropertyName("useDefaultAsOptimal")]
    public bool UseDefaultAsOptimal { get; set; } = true;

    [JsonPropertyName("available")]
    public List<Region> Available { get; set; } = [];

    public class Region {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("endpoint")]
        public string Endpoint { get; set; } = null!;

        [JsonPropertyName("vip")]
        public bool Vip { get; set; } = false;

        [JsonPropertyName("custom")]
        public bool Custom { get; set; } = false;

        [JsonPropertyName("deprecated")]
        public bool Deprecated { get; set; } = false;
    }
}

public class ExternalTokensConfiguration {
    [JsonPropertyName("twitter")]
    public string? Twitter { get; set; } = null;
}

public class GuildConfiguration {
    [JsonPropertyName("defaultFeatures")]
    public List<string> DefaultFeatures { get; set; } = [];

    [JsonPropertyName("autoJoin")]
    public GuildAutoJoinConfiguration AutoJoin { get; set; } = new();

    [JsonPropertyName("discovery")]
    public GuildDiscoveryConfiguration Discovery { get; set; } = new();

    public class GuildDiscoveryConfiguration {
        [JsonPropertyName("showAllGuilds")]
        public bool ShowAllGuilds { get; set; } = false;

        [JsonPropertyName("useRecommendation")]
        public bool UseRecommendation { get; set; } = false;

        [JsonPropertyName("offset")]
        public int Offset { get; set; } = 0;

        [JsonPropertyName("limit")]
        public int Limit { get; set; } = 24;
    }

    public class GuildAutoJoinConfiguration {
        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; } = false;

        [JsonPropertyName("guilds")]
        public List<string> Guilds { get; set; } = [];

        [JsonPropertyName("canLeave")]
        public bool CanLeave { get; set; } = true;

        [JsonPropertyName("bots")]
        public bool Bots { get; set; } = false;
    }
}