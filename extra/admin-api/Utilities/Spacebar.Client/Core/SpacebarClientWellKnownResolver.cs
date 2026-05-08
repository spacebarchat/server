using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Spacebar.Client.Core;

public class SpacebarClientWellKnownResolverService(ILogger<SpacebarClientWellKnownResolverService> logger) {
    public async Task<SpacebarClientWellKnown> ResolveClientWellKnown(string serverName) {
        using var hc = new HttpClient();
        logger.LogInformation("Resolving .well-known for {serverName}", serverName);
        return await hc.GetFromJsonAsync<SpacebarClientWellKnown>($"https://{serverName}/.well-known/spacebar/client")!;
    }
}

public class SpacebarClientWellKnown {
    [JsonPropertyName("api")]
    public required ApiWellKnownData Api { get; set; }

    [JsonPropertyName("cdn")]
    public required GenericUrlWellKnownData Cdn { get; set; }

    [JsonPropertyName("admin")]
    public GenericUrlWellKnownData? Admin { get; set; }

    [JsonPropertyName("gateway")]
    public required GatewayWellKnownData Gateway { get; set; }
    
    public class GenericUrlWellKnownData {
        [JsonPropertyName("baseUrl")]
        public required string BaseUrl { get; set; }
    }

    public class ApiWellKnownData : GenericUrlWellKnownData {
        [JsonPropertyName("apiVersions")]
        public required ApiVersionsData ApiVersions { get; set; }
        
        // Utility methods
        public Uri GetApiBaseUrl(string? version = null) {
            return new Uri(BaseUrl + "/api/v" + (version ?? ApiVersions.Default));
        }

        public class ApiVersionsData {
            [JsonPropertyName("default")]
            public required string Default { get; set; }

            [JsonPropertyName("active")]
            public required List<string> Active { get; set; }
        }
    }

    public class GatewayWellKnownData : GenericUrlWellKnownData {
        [JsonPropertyName("encoding")]
        public required List<string> Encoding { get; set; }

        [JsonPropertyName("compression")]
        public required List<string?> Compression { get; set; }
    }
}