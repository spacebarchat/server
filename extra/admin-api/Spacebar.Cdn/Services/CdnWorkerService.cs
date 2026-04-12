using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Net.Sockets;
using ArcaneLibs.Extensions;

namespace Spacebar.Cdn.Services;

public class CdnWorkerService(SpacebarCdnWorkerConfiguration cfg, IHostApplicationLifetime lifetime) : IDisposable {
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

    [SuppressMessage("Interoperability", "CA1416:Validate platform compatibility", Justification = "Unix is presumed by the developers - depends on unix sockets anyhow")]
    private HttpClient[] GetWorkerHttpClients(List<string> urls) {
        List<HttpClient> results = [];
        foreach (var url in urls) {
            Console.WriteLine("  - Handling worker URI/path: " + url);
            if (url.StartsWith("http://unix:")) results.Add(HttpClientFactory.GetHttpClientForSocket(url));
            else if (url.StartsWith("http://") || url.StartsWith("https://")) results.Add(HttpClientFactory.GetHttpClientForUrl(url));
            else if (File.Exists(url) && File.GetUnixFileMode(url).HasFlag(UnixFileMode.OtherExecute)) {
                var res = HttpClientFactory.GetHttpClientForExec(url);
                results.Add(res.client);
                lifetime.ApplicationStopped.Register(() => {
                    Console.WriteLine("Killing CDN worker...");
                    res.p.Kill();
                    res.p.WaitForExit();
                    Console.WriteLine("CDN worker killed!");
                });
            }
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

internal class HttpClientFactory {
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
            BaseAddress = new Uri("http://localhost"), // just a dummy value, since dotnet still wants it :)
            Timeout = TimeSpan.FromMinutes(15)         // because stuff can get slow, we want caching to at least attempt to succeed
        };
    }

    public static HttpClient GetHttpClientForUrl(string url) {
        return new HttpClient {
            BaseAddress = new(url),
            Timeout = TimeSpan.FromMinutes(15)
        };
    }

    public static (HttpClient client, Process p) GetHttpClientForExec(string path) {
        var url = $"http://unix:{Path.GetTempPath()}sb-cdn-worker-{Random.Shared.GetHexString(32)}.sock";
        var psi = new ProcessStartInfo() {
            FileName = path,
            RedirectStandardError = true, RedirectStandardOutput = true
        };
        psi.Environment["DOTNET_URLS"] = url;
        var p = Process.Start(psi);
        p.OutputDataReceived += (_, args) => Console.WriteLine("[CDN Worker/OUT] " + args.Data);
        p.ErrorDataReceived += (_, args) => Console.WriteLine("[CDN Worker/ERR] " + args.Data);
        p.BeginErrorReadLine();
        p.BeginOutputReadLine();
        return (GetHttpClientForSocket(url), p);
    }
}