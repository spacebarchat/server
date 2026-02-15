using System.Net.Sockets;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Spacebar.Interop.Replication.Abstractions;

namespace Spacebar.Interop.Replication.UnixSocket;

public class UnixSocketSpacebarReplication(UnixSocketConfiguration conf) : ISpacebarReplication {
    private readonly Dictionary<string, Socket> _sockets = new();

    public async Task InitializeAsync() {
        var fsw = new FileSystemWatcher(conf.SocketDir);
        fsw.EnableRaisingEvents = true;
        fsw.Created += (s, e) => {
            Console.WriteLine($"Socket created: {e.FullPath}");
            var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified);
            var ep = new UnixDomainSocketEndPoint(e.FullPath);
            socket.Connect(ep);
            _sockets[e.Name] = socket;
        };
    }

    public async Task SendAsync(ReplicationMessage message) {
        // message format: [uint32be length][payload]
        var payload = JsonSerializer.SerializeToUtf8Bytes(message);
        byte[] formattedPayload = [..BitConverter.GetBytes(System.Net.IPAddress.HostToNetworkOrder(payload.Length)), ..payload];

        Parallel.ForEach(_sockets, skv => {
            lock (skv.Value)
                skv.Value.SendAsync(formattedPayload);
        });
    }
}

public class UnixSocketConfiguration {
    public UnixSocketConfiguration(IConfiguration config) {
        config.GetRequiredSection("Spacebar").GetRequiredSection("UnixSocketReplication").Bind(this);
    }

    public string SocketDir { get; set; } = null!;
}