using Microsoft.Extensions.Configuration;

namespace Spacebar.RabbitMqUtilities;

public class RabbitMQConfiguration {
    public RabbitMQConfiguration(IConfiguration configuration) {
        configuration.GetRequiredSection("RabbitMQ").Bind(this);
    }
    public required string Host { get; set; }
    public required string Username { get; set; }
    public required string Password { get; set; }
    public required string Port { get; set; }
    
    public string ToConnectionString() {
        return $"amqp://{Username}:{Password}@{Host}:{Port}";
    }
}