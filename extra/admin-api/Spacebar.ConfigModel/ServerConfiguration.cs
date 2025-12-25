using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class ServerConfiguration {
    [JsonPropertyName("admin")] public EndpointConfiguration Admin = new EndpointConfiguration();
    [JsonPropertyName("gateway")] public EndpointConfiguration Gateway = new EndpointConfiguration();
    [JsonPropertyName("cdn")] public CdnConfiguration Cdn = new CdnConfiguration();
    [JsonPropertyName("api")] public ApiConfiguration Api = new ApiConfiguration();
    [JsonPropertyName("general")] public GeneralConfiguration General = new GeneralConfiguration();
    [JsonPropertyName("limits")] public LimitsConfiguration Limits = new LimitsConfiguration();
    [JsonPropertyName("security")] public SecurityConfiguration Security = new SecurityConfiguration();
    [JsonPropertyName("login")] public LoginConfiguration Login = new LoginConfiguration();
    [JsonPropertyName("register")] public RegisterConfiguration Register = new RegisterConfiguration();
    [JsonPropertyName("regions")] public RegionConfiguration Regions = new RegionConfiguration();
    [JsonPropertyName("guild")] public GuildConfiguration Guild = new GuildConfiguration();
    [JsonPropertyName("gif")] public GifConfiguration Gif = new GifConfiguration();
    [JsonPropertyName("rabbitmq")] public RabbitMQConfiguration Rabbitmq = new RabbitMQConfiguration();
    [JsonPropertyName("kafka")] public KafkaConfiguration Kafka = new KafkaConfiguration();
    [JsonPropertyName("templates")] public TemplateConfiguration Templates = new TemplateConfiguration();
    [JsonPropertyName("metrics")] public MetricsConfiguration Metrics = new MetricsConfiguration();
    [JsonPropertyName("defaults")] public DefaultsConfiguration Defaults = new DefaultsConfiguration();
    [JsonPropertyName("external")] public ExternalTokensConfiguration External = new ExternalTokensConfiguration();
    [JsonPropertyName("email")] public EmailConfiguration Email = new EmailConfiguration();
    [JsonPropertyName("passwordReset")] public PasswordResetConfiguration PasswordReset = new PasswordResetConfiguration();
    [JsonPropertyName("user")] public UserConfiguration User = new UserConfiguration();
}

public class GeneralConfiguration {
    [JsonPropertyName("instanceName")] public string InstanceName = "Spacebar Instance";

    [JsonPropertyName("instanceDescription")]
    public string? InstanceDescription = "This is a Spacebar instance made in the pre-release days";

    [JsonPropertyName("frontPage")] public string? FrontPage = null;
    [JsonPropertyName("tosPage")] public string? TosPage = null;

    [JsonPropertyName("correspondenceEmail")]
    public string? CorrespondenceEmail = null;

    [JsonPropertyName("correspondenceUserID")]
    public string? CorrespondenceUserId = null;

    [JsonPropertyName("image")] public string? Image = null;
    [JsonPropertyName("instanceId")] public string InstanceId = Snowflake.generate();

    [JsonPropertyName("autoCreateBotUsers")]
    public bool AutoCreateBotUsers = false;
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
    [JsonPropertyName("resizeHeightMax")] public int ResizeHeightMax = 1000;
    [JsonPropertyName("resizeWidthMax")] public int ResizeWidthMax = 1000;
    [JsonPropertyName("imagorServerUrl")] public string? ImagorServerUrl = null;

    [JsonPropertyName("proxyCacheHeaderSeconds")]
    public int ProxyCacheHeaderSeconds = 60 * 60 * 24;

    [JsonPropertyName("maxAttachmentSize")]
    public int MaxAttachmentSize = 25 * 1024 * 1024; // 25 MB

    // limits: CdnLimitsConfiguration = new CdnLimitsConfiguration();
}

public class CdnLimitsConfiguration {
    // ordered by route register order in CDN...
    [JsonPropertyName("icon")] public CdnImageLimitsConfiguration Icon = new CdnImageLimitsConfiguration();
    [JsonPropertyName("roleIcon")] public CdnImageLimitsConfiguration RoleIcon = new CdnImageLimitsConfiguration();
    [JsonPropertyName("emoji")] public CdnImageLimitsConfiguration Emoji = new CdnImageLimitsConfiguration();
    [JsonPropertyName("sticker")] public CdnImageLimitsConfiguration Sticker = new CdnImageLimitsConfiguration();
    [JsonPropertyName("banner")] public CdnImageLimitsConfiguration Banner = new CdnImageLimitsConfiguration();
    [JsonPropertyName("splash")] public CdnImageLimitsConfiguration Splash = new CdnImageLimitsConfiguration();
    [JsonPropertyName("avatar")] public CdnImageLimitsConfiguration Avatar = new CdnImageLimitsConfiguration();
    [JsonPropertyName("discoverySplash")] public CdnImageLimitsConfiguration DiscoverySplash = new CdnImageLimitsConfiguration();
    [JsonPropertyName("appIcon")] public CdnImageLimitsConfiguration AppIcon = new CdnImageLimitsConfiguration();
    [JsonPropertyName("discoverSplash")] public CdnImageLimitsConfiguration DiscoverSplash = new CdnImageLimitsConfiguration(); //what even is this?
    [JsonPropertyName("teamIcon")] public CdnImageLimitsConfiguration TeamIcon = new CdnImageLimitsConfiguration();
    [JsonPropertyName("channelIcon")] public CdnImageLimitsConfiguration ChannelIcon = new CdnImageLimitsConfiguration(); // is this even used?
    [JsonPropertyName("guildAvatar")] public CdnImageLimitsConfiguration GuildAvatar = new CdnImageLimitsConfiguration();
}

public class CdnImageLimitsConfiguration {
    [JsonPropertyName("maxHeight")] public int MaxHeight = 8192;
    [JsonPropertyName("maxWidth")] public int MaxWidth = 8192;

    [JsonPropertyName("maxSize")] public int MaxSize = 10 * 1024 * 1024; // 10 MB

    // "always" | "never" | "premium"
    [JsonPropertyName("allowAnimated")] public string AllowAnimated = "always";
}