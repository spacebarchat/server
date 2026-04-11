namespace Spacebar.Cdn;

public class SpacebarCdnConfiguration
{
    public SpacebarCdnConfiguration(IConfiguration configuration) {
        configuration.GetRequiredSection("Spacebar").GetRequiredSection("Cdn").Bind(this);
    }
    
    // public 

}

// public class SpacebarCdnWorkerConfiguration
// {
//     public 
// }