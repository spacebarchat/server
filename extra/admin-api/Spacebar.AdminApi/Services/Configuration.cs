namespace Spacebar.AdminApi.Services;

public class Configuration {
    public Configuration(IConfiguration configuration) {
        configuration.GetRequiredSection("SpacebarAdminApi").Bind(this);
    }
    
    public string? OverrideUid { get; set; }
    public bool DisableAuthentication { get; set; } = false;
    public bool Enforce2FA { get; set; } = true;
}