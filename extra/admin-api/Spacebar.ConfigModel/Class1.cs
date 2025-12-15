using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class Config
{
    [JsonPropertyName("admin")] public EndpointConfig Admin { get; set; } = null!;
    [JsonPropertyName("api")] public EndpointConfig Api { get; set; } = null!;
    [JsonPropertyName("gateway")] public EndpointConfig Gateway { get; set; } = null!;
    [JsonPropertyName("cdn")] public EndpointConfig Cdn { get; set; } = null!;

    public Config ReadFromKv(Dictionary<string, object?> kv)
    {
        // to object
        

        foreach (var (key, value) in kv)
        {
            switch (key.Split('_', 2)[0])
            {
                default:
                    Console.WriteLine($"Unrecognized config key prefix: {key}");
                    continue;
            }
        }

        return this;
    }
}

public class EndpointConfig
{
    [JsonPropertyName("endpointPrivate")] public string? EndpointPrivate { get; set; }
    [JsonPropertyName("endpointPublic")] public string? EndpointPublic { get; set; }

    public EndpointConfig ReadFromKv(Dictionary<string, object?> kv, string prefix)
    {
        foreach (var (key, value) in kv)
        {
            if (!key.StartsWith(prefix + "_")) continue;
            var subKey = key[(prefix + "_").Length..];
            switch (subKey)
            {
                case "ENDPOINT_PRIVATE":
                    EndpointPrivate = value?.ToString();
                    break;
                case "ENDPOINT_PUBLIC":
                    EndpointPublic = value?.ToString();
                    break;
                default:
                    Console.WriteLine($"Unrecognized config key: {key}");
                    break;
            }
        }

        return this;
    }
}

public class ApiConfig : EndpointConfig
{
    [JsonPropertyName("activeVersions")] public List<string> ActiveVersions { get; set; } = null!;
    [JsonPropertyName("defaultVersion")] public string DefaultVersion { get; set; } = null!;
}