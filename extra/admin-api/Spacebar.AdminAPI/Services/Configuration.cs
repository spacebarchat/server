namespace Spacebar.AdminAPI.Services;

public class Configuration {
    public Configuration(IConfiguration configuration) {
        configuration.GetRequiredSection("SpacebarAdminApi").Bind(this);
    }
    
    public string? OverrideUid { get; set; }
}