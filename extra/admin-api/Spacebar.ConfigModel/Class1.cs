using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class Config {
    [JsonPropertyName("admin")]
    public EndpointConfig Admin { get; set; } = null!;

    [JsonPropertyName("api")]
    public EndpointConfig Api { get; set; } = null!;

    [JsonPropertyName("gateway")]
    public EndpointConfig Gateway { get; set; } = null!;

    [JsonPropertyName("cdn")]
    public EndpointConfig Cdn { get; set; } = null!;
}

public class EndpointConfig {
    [JsonPropertyName("endpointPrivate")]
    public string? EndpointPrivate { get; set; }

    [JsonPropertyName("endpointPublic")]
    public string? EndpointPublic { get; set; }
}

public class ApiConfig : EndpointConfig {
    [JsonPropertyName("activeVersions")]
    public List<string> ActiveVersions { get; set; } = null!;

    [JsonPropertyName("defaultVersion")]
    public string DefaultVersion { get; set; } = null!;
}