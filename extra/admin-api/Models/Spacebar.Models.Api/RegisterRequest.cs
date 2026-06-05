using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class RegisterRequest {
    [JsonPropertyName("username")]
    public string Username { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [JsonPropertyName("consent")]
    public bool Consent { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("fingerprint")]
    public string? Fingerprint { get; set; }

    [JsonPropertyName("invite")]
    public string? Invite { get; set; }

    [JsonPropertyName("date_of_birth")]
    public DateTimeOffset? DateOfBirth { get; set; }

    [JsonPropertyName("gift_code_sku_id")]
    public string? GiftCodeSkuId { get; set; }

    [JsonPropertyName("promotional_email_opt_in")]
    public bool? PromotionalEmailOptIn { get; set; }

    [JsonPropertyName("unique_username_registration")]
    public bool? UniqueUsernameRegistration { get; set; }

    [JsonPropertyName("global_name")]
    public bool? GlobalName { get; set; }
}

public class RegisterResponse {
    [JsonPropertyName("token")]
    public string Token { get; set; }
    
    [JsonPropertyName("show_verification_form")]
    public bool? ShowVerificationForm { get; set; }
}