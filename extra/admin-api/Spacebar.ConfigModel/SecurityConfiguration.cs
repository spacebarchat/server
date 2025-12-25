using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class SecurityConfiguration {
    [JsonPropertyName("captcha")]
    public CaptchaConfiguration Captcha { get; set; } = new();

    [JsonPropertyName("twoFactor")]
    public TwoFactorConfiguration TwoFactor { get; set; } = new();

    [JsonPropertyName("autoUpdate")]
    public bool AutoUpdate { get; set; } = true;

    [JsonPropertyName("requestSignature")] public string RequestSignature; // {get;set;}=crypto.randomBytes(32).toString("base64");

    [JsonPropertyName("jwtSecret")]
    public string? JwtSecret { get; set; } = null;

    [JsonPropertyName("forwardedFor")]
    public string? ForwardedFor { get; set; } = null;

    [JsonPropertyName("trustedProxies")]
    public string TrustedProxies { get; set; } = null;

    [JsonPropertyName("abuseIpDbApiKey")]
    public string? AbuseIpDbApiKey { get; set; } = null;

    [JsonPropertyName("abuseipdbBlacklistRatelimit")]
    public int AbuseipdbBlacklistRatelimit { get; set; } = 5;

    [JsonPropertyName("abuseipdbConfidenceScoreTreshold")]
    public int AbuseipdbConfidenceScoreTreshold { get; set; } = 50;

    [JsonPropertyName("ipdataApiKey")]
    public string? IpdataApiKey { get; set; } = null;

    [JsonPropertyName("mfaBackupCodeCount")]
    public int MfaBackupCodeCount { get; set; } = 10;

    [JsonPropertyName("statsWorldReadable")]
    public bool StatsWorldReadable { get; set; } = true;

    [JsonPropertyName("defaultRegistrationTokenExpiration")]
    public int DefaultRegistrationTokenExpiration { get; set; } = 1000 * 60 * 60 * 24 * 7;

    [JsonPropertyName("cdnSignUrls")]
    public bool CdnSignUrls { get; set; } = false;

    [JsonPropertyName("cdnSignatureKey")]
    public string CdnSignatureKey { get; set; } = null!; // crypto.randomBytes(32).toString("base64");

    [JsonPropertyName("cdnSignatureDuration")]
    public string CdnSignatureDuration { get; set; } = "24h";

    [JsonPropertyName("cdnSignatureIncludeIp")]
    public bool CdnSignatureIncludeIp { get; set; } = true;

    [JsonPropertyName("cdnSignatureIncludeUserAgent")]
    public bool CdnSignatureIncludeUserAgent { get; set; } = true;
}

public class CaptchaConfiguration {
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = false;

    /// <summary>
    /// One of: null, recaptcha, hcaptcha
    /// </summary>
    [JsonPropertyName("service")]
    public string Service { get; set; } = "none";

    [JsonPropertyName("sitekey")]
    public string? SiteKey { get; set; } = null;

    [JsonPropertyName("secret")]
    public string? Secret { get; set; } = null;
}

public class TwoFactorConfiguration {
    [JsonPropertyName("generateBackupCodes")]
    public bool GenerateBackupCodes { get; set; } = true;
}