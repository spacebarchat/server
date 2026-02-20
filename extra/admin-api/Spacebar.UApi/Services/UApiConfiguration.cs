namespace Spacebar.UApi.Services;

public class UApiConfiguration {
    public UApiConfiguration(IConfiguration config) {
        config.GetRequiredSection("Spacebar").GetRequiredSection("UApi").Bind(this);
    }
    
    // ... for unhandled routes
    public string? FallbackApiEndpoint { get; set; }
}