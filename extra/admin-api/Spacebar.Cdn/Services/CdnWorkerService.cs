using System.Diagnostics;
using System.Net.Sockets;
using ArcaneLibs.Extensions;

namespace Spacebar.Cdn.Services;

public class CdnWorkerService(SpacebarCdnWorkerConfiguration cfg) : IDisposable {
    private int _q8Idx = 0;
    private int _q16Idx = 0;
    private int _q16HdriIdx = 0;
    private HttpClient[] _q8HttpClients = [];
    private HttpClient[] _q16HttpClients = [];
    private HttpClient[] _q16HdriHttpClients = [];
    private List<Process> _workerProcesses = [];

    public void Initialize() {
        Console.WriteLine("Initializing CDN worker store...");
        Console.WriteLine(" - Q8");
        _q8HttpClients = GetWorkerHttpClients(cfg.Q8Workers);
        Console.WriteLine(" - Q16");
        _q16HttpClients = GetWorkerHttpClients(cfg.Q16Workers);
        Console.WriteLine(" - Q16-HDRI");
        _q16HdriHttpClients = GetWorkerHttpClients(cfg.Q16HdriWorkers);
        Console.WriteLine("Done initializing CDN worker store!");
    }

    private static HttpClient[] GetWorkerHttpClients(List<string> urls) {
        List<HttpClient> results = [];
        foreach (var url in urls) {
            Console.WriteLine("  - Handling worker URI/path: " + url);
            if (url.StartsWith("http://unix:")) results.Add(UnixSocketHttpClientFactory.GetHttpClientForSocket(url));
            else if (url.StartsWith("http://") || url.StartsWith("https://")) results.Add(new HttpClient() { BaseAddress = new(url) });
            // else if (File.Exists(url)) { }
            else throw new NotImplementedException($"Don't know how to handle worker URL \"{url}\"");
        }

        Console.WriteLine($"  => {results.Count} results");
        return results.ToArray();
    }

    public HttpClient GetRawClient(string variant) {
        Console.WriteLine($"GetRawClient: q8={_q8Idx}/{_q8HttpClients.Length} q16={_q16Idx}/{_q16HttpClients.Length} q16Hdri={_q16HdriIdx}/{_q16HdriHttpClients.Length} ");
        return variant switch {
            "q8" => _q8HttpClients[_q8Idx++ % _q8HttpClients.Length],
            "q16" => _q16HttpClients[_q16Idx++ % _q16HttpClients.Length],
            "q16-hdr" => _q16HdriHttpClients[_q16HdriIdx++ % _q16HdriHttpClients.Length],
            _ => throw new ArgumentException("Variant must be q8/q16/q16-hdri")
        };
    }

    public void Dispose() {
        foreach (var hc in _q8HttpClients) hc.Dispose();
        foreach (var hc in _q16HttpClients) hc.Dispose();
        foreach (var hc in _q16HdriHttpClients) hc.Dispose();
        foreach (var proc in _workerProcesses) {
            if (proc.HasExited) continue;
            proc.Kill(true);
            proc.Dispose();
        }
    }
}

internal class UnixSocketHttpClientFactory {
    internal static HttpClient GetHttpClientForSocket(string url) {
        var socketPath = new Uri(url).LocalPath;
        var httpHandler = new SocketsHttpHandler {
            ConnectCallback = async (ctx, ct) => {
                var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.IP);
                var endpoint = new UnixDomainSocketEndPoint(socketPath);
                await socket.ConnectAsync(endpoint, ct);
                // tell the socket handler it owns the stream and can dispose it
                return new NetworkStream(socket, ownsSocket: true);
            }
        };
        return new HttpClient(httpHandler) {
            BaseAddress = new Uri("http://localhost") // just a dummy value, since dotnet still wants  :)
        };
    }
}