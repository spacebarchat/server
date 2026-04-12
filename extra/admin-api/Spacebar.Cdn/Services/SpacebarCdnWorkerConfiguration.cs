using Newtonsoft.Json;

namespace Spacebar.Cdn.Services;

public class SpacebarCdnWorkerConfiguration {
    public SpacebarCdnWorkerConfiguration(IConfiguration config) {
        config.GetRequiredSection("Spacebar").GetRequiredSection("Cdn").GetRequiredSection("Workers").Bind(this);
    }

    [JsonProperty("q8")]
    public List<string> Q8Workers { get; set; } = [];

    [JsonProperty("q16")]
    public List<string> Q16Workers { get; set; } = [];

    [JsonProperty("q16-hdri")]
    public List<string> Q16HdriWorkers { get; set; } = [];
}