using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class SecurityConfiguration
{
    [JsonPropertyName("captcha")] public CaptchaConfiguration Captcha = new CaptchaConfiguration();
    [JsonPropertyName("twoFactor")] public TwoFactorConfiguration TwoFactor = new TwoFactorConfiguration();
    [JsonPropertyName("autoUpdate")] public bool AutoUpdate = true;
    [JsonPropertyName("requestSignature")] public string RequestSignature; // = crypto.randomBytes(32).toString("base64");
    [JsonPropertyName("jwtSecret")] public string? JwtSecret = null;
    [JsonPropertyName("forwardedFor")] public string? ForwardedFor = null;
    [JsonPropertyName("trustedProxies")] public string TrustedProxies = null;
    [JsonPropertyName("abuseIpDbApiKey")] public string? AbuseIpDbApiKey = null;
    [JsonPropertyName("abuseipdbBlacklistRatelimit")] public int AbuseipdbBlacklistRatelimit = 5;
    [JsonPropertyName("abuseipdbConfidenceScoreTreshold")] public int AbuseipdbConfidenceScoreTreshold = 50;
    [JsonPropertyName("ipdataApiKey")] public string? IpdataApiKey = null;
    [JsonPropertyName("mfaBackupCodeCount")] public int MfaBackupCodeCount = 10;
    [JsonPropertyName("statsWorldReadable")] public bool StatsWorldReadable = true;
    [JsonPropertyName("defaultRegistrationTokenExpiration")] public int DefaultRegistrationTokenExpiration = 1000 * 60 * 60 * 24 * 7;
    [JsonPropertyName("cdnSignUrls")] public bool CdnSignUrls = false;
    [JsonPropertyName("cdnSignatureKey")] public string CdnSignatureKey = crypto.randomBytes(32).toString("base64");
    [JsonPropertyName("cdnSignatureDuration")] public string CdnSignatureDuration = "24h";
    [JsonPropertyName("cdnSignatureIncludeIp")] public bool CdnSignatureIncludeIp = true;
    [JsonPropertyName("cdnSignatureIncludeUserAgent")] public bool CdnSignatureIncludeUserAgent = true;
}