using RabbitMQ.Client;

namespace Spacebar.RabbitMqUtilities;

public interface IRabbitMQService {
    IConnection CreateChannel();
}

public class RabbitMQService(RabbitMQConfiguration config) : IRabbitMQService {
    public IConnection CreateChannel() {
        var connection = new ConnectionFactory {
            UserName = config.Username,
            Password = config.Password,
            HostName = config.Host,
            // DispatchConsumersAsync = true
        };

        var channel = connection.CreateConnection();
        return channel;
    }
}