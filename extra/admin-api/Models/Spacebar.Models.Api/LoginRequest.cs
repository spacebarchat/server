using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class LoginRequest {
    [JsonPropertyName("login")]
    public required string Login { get; set; }
    
    [JsonPropertyName("password")]
    public required string Password { get; set; }
    
    /// <summary>
    /// Whether to un-delete a self-disabled or self-deleted account
    /// </summary>
    [JsonPropertyName("undelete")]
    public bool? Undelete { get; set; }
    
    /// <summary>
    /// One of gift, guild_template, guild_invite, dm_invite, friend_invite, role_subscription or role_subscription_setting
    /// </summary>
    [JsonPropertyName("login_source")]
    public string? LoginSource { get; set; }
    
    [JsonPropertyName("gift_code_sku_id")]
    public string? GiftCodeSkuId { get; set; }
}

/// <summary>
/// Note: nullable fields missing "if the login was not completed"
/// </summary>
public class LoginResponse {
    [JsonPropertyName("user_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public ulong UserId { get; set; }
    
    [JsonPropertyName("token")]
    public string? Token { get; set; }
    
    [JsonPropertyName("user_settings")]
    public LoginUserSettings? UserSettings { get; set; }
    
    /// <summary>
    /// Values: update_password
    /// </summary>
    [JsonPropertyName("required_actions")]
    public List<string>? RequiredActions { get; set; }
    
    /// <summary>
    /// MFA ticket
    /// </summary>
    [JsonPropertyName("ticket")]
    public string? Ticket { get; set; }
    
    [JsonPropertyName("login_instance_id")]
    public string? LoginInstanceId { get; set; }
    
    [JsonPropertyName("mfa")]
    public bool? Mfa { get; set; }
    
    [JsonPropertyName("totp")]
    public bool? Totp { get; set; }
    
    [JsonPropertyName("sms")]
    public bool? Sms { get; set; }
    
    [JsonPropertyName("backup")]
    public bool? Backup { get; set; }
    
    [JsonPropertyName("webauthn")]
    public string? Webauthn { get; set; }
    

    public class LoginUserSettings {
        [JsonPropertyName("locale")]
        public string Locale { get; set; }
        
        [JsonPropertyName("theme")]
        public string Theme { get; set; }
    }
}