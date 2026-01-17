using ArcaneLibs.Extensions;
using RabbitMQ.Client;
using Spacebar.Interop.Replication.Abstractions;

namespace Spacebar.Interop.Replication.RabbitMq;

public class RabbitMqSpacebarReplication : ISpacebarReplication {
    private IConnection _mqConnection = null!;
    private IChannel _mqChannel = null!;
    private bool _isInitialised;

    public async Task InitializeAsync() {
        lock (this) {
            if (_isInitialised) return;
            _isInitialised = true;
        }

        var factory = new ConnectionFactory {
            Uri = new Uri("amqp://guest:guest@127.0.0.1/")
        };
        _mqConnection = await factory.CreateConnectionAsync();
        _mqChannel = await _mqConnection.CreateChannelAsync();
    }

    public async Task SendAsync(ReplicationMessage message) {
        var exchangeId = message.GuildId ?? message.ChannelId ?? message.UserId ?? "global";
        await _mqChannel.ExchangeDeclareAsync(exchange: exchangeId, type: ExchangeType.Fanout, durable: false);
        var props = new BasicProperties() { Type = message.Event };
        var publishSuccess = false;
        var body = message.Payload.ToJson().AsBytes().ToArray(); // TODO: byte array payloads etc someday?

        do {
            try {
                await _mqChannel.BasicPublishAsync(exchange: exchangeId, routingKey: "", mandatory: true, basicProperties: props, body: body);
                publishSuccess = true;
            }
            catch (Exception e) {
                Console.WriteLine($"[RabbitMQ] Error publishing {message.Event}: {e.Message}");
                await Task.Delay(10);
            }
        } while (!publishSuccess);
    }
}