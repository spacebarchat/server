using Microsoft.Extensions.Configuration;

namespace Spacebar.Interop.Authentication;

public class SpacebarAuthenticationConfiguration {
    public SpacebarAuthenticationConfiguration(IConfiguration configuration) {
        configuration.GetRequiredSection("Spacebar").GetRequiredSection("Authentication").Bind(this);
    }
    
    public required string PrivateKeyPath { get; set; }
    public required string PublicKeyPath { get; set; }
    
    public string? OverrideUid { get; set; }
    public bool DisableAuthentication { get; set; } = false;
    public bool Enforce2FA { get; set; } = true;
    public TimeSpan AuthCacheExpiry { get; set; } = TimeSpan.FromSeconds(30);
}