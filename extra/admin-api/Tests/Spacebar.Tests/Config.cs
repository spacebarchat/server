using Microsoft.Extensions.Configuration;

namespace Spacebar.Tests;

public class Config {
    public Config(IConfiguration? config) {
        config.GetSection("Configuration").Bind(this);
    }

    public string TestInstance { get; set; }
}