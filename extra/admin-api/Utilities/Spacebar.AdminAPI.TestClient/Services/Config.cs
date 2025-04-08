using System.Text.Json.Serialization;

namespace Spacebar.AdminAPI.TestClient.Services;

public class Config {
    [JsonPropertyName("api_url")]
    public string ApiUrl { get; set; } = "http://localhost:3001";
    
    [JsonPropertyName("gateway_url")]
    public string GatewayUrl { get; set; } = "http://localhost:3002";
    
    [JsonPropertyName("cdn_url")]
    public string CdnUrl { get; set; } = "http://localhost:3003";
    
    [JsonPropertyName("admin_url")]
    public string AdminUrl { get; set; } = "http://localhost:5112";
    
    [JsonPropertyName("access_token")]
    public string? AccessToken { get; set; } = string.Empty;
}