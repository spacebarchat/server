using RabbitMQ.Client;

namespace Spacebar.RabbitMqUtilities;

public interface IRabbitMQService {
    Task<IConnection> CreateChannel();
}

public class RabbitMQService(RabbitMQConfiguration config) : IRabbitMQService {
    public async Task<IConnection> CreateChannel() {
        var connection = new ConnectionFactory {
            UserName = config.Username,
            Password = config.Password,
            HostName = config.Host,
            // DispatchConsumersAsync = true
        };

        var channel = await connection.CreateConnectionAsync();
        return channel;
    }
}