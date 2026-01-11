#define SINGLE_HTTPCLIENT // Use a single HttpClient instance for all MatrixHttpClient instances
// #define SYNC_HTTPCLIENT   // Only allow one request as a time, for debugging
using System.Data;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using ArcaneLibs;
using ArcaneLibs.Extensions;

namespace Spacebar.AdminApi.TestClient.Services;

#if SINGLE_HTTPCLIENT
// TODO: Add URI wrapper for
public class StreamingHttpClient {
    private static readonly HttpClient Client;

    static StreamingHttpClient() {
        try {
            var handler = new SocketsHttpHandler {
                PooledConnectionLifetime = TimeSpan.FromMinutes(15),
                MaxConnectionsPerServer = 4096,
                EnableMultipleHttp2Connections = true
            };
            Client = new HttpClient(handler) {
                DefaultRequestVersion = new Version(3, 0),
                Timeout = TimeSpan.FromDays(1)
            };
        }
        catch (PlatformNotSupportedException e) {
            Console.WriteLine("Failed to create HttpClient with connection pooling, continuing without connection pool!");
            Console.WriteLine("Original exception (safe to ignore!):");
            Console.WriteLine(e);

            Client = new HttpClient {
                DefaultRequestVersion = new Version(3, 0)
            };
        }
        catch (Exception e) {
            Console.WriteLine("Failed to create HttpClient:");
            Console.WriteLine(e);
            throw;
        }
    }

#if SYNC_HTTPCLIENT
    internal SemaphoreSlim _rateLimitSemaphore { get; } = new(1, 1);
#endif

    public static bool LogRequests = true;
    public Dictionary<string, string> AdditionalQueryParameters { get; set; } = new();

    public Uri? BaseAddress { get; set; }

    // default headers, not bound to client
    public HttpRequestHeaders DefaultRequestHeaders { get; set; } =
        typeof(HttpRequestHeaders).GetConstructor(BindingFlags.NonPublic | BindingFlags.Instance, null, [], null)?.Invoke([]) as HttpRequestHeaders ??
        throw new InvalidOperationException("Failed to create HttpRequestHeaders");

    private static JsonSerializerOptions GetJsonSerializerOptions(JsonSerializerOptions? options = null) {
        options ??= new JsonSerializerOptions();
        // options.Converters.Add(new JsonFloatStringConverter());
        // options.Converters.Add(new JsonDoubleStringConverter());
        // options.Converters.Add(new JsonDecimalStringConverter());
        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        return options;
    }

    public async Task<HttpResponseMessage> SendUnhandledAsync(HttpRequestMessage request, CancellationToken? cancellationToken) {
        if (request.RequestUri is null) throw new NullReferenceException("RequestUri is null");
        // if (!request.RequestUri.IsAbsoluteUri)
        request.RequestUri = request.RequestUri.EnsureAbsolute(BaseAddress!);
        var swWait = Stopwatch.StartNew();
#if SYNC_HTTPCLIENT
        await _rateLimitSemaphore.WaitAsync(cancellationToken);
#endif

        if (request.RequestUri is null) throw new NullReferenceException("RequestUri is null");
        if (!request.RequestUri.IsAbsoluteUri)
            request.RequestUri = new Uri(BaseAddress ?? throw new InvalidOperationException("Relative URI passed, but no BaseAddress is specified!"), request.RequestUri);
        swWait.Stop();
        var swExec = Stopwatch.StartNew();

        foreach (var (key, value) in AdditionalQueryParameters) request.RequestUri = request.RequestUri.AddQuery(key, value);
        foreach (var (key, value) in DefaultRequestHeaders) {
            if (request.Headers.Contains(key)) continue;
            request.Headers.Add(key, value);
        }

        request.Options.Set(new HttpRequestOptionsKey<bool>("WebAssemblyEnableStreamingResponse"), true);

        if (LogRequests)
            Console.WriteLine("Sending " + request.Summarise(includeHeaders: true, includeQuery: true, includeContentIfText: false, hideHeaders: ["Accept"]));

        HttpResponseMessage? responseMessage;
        try {
            responseMessage = await Client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken ?? CancellationToken.None);
        }
        catch (Exception e) {
            if (e is TaskCanceledException or TimeoutException) {
                if (request.Method == HttpMethod.Get && !(cancellationToken?.IsCancellationRequested ?? false)) {
                    await Task.Delay(Random.Shared.Next(500, 2500), cancellationToken ?? CancellationToken.None);
                    request.ResetSendStatus();
                    return await SendAsync(request, cancellationToken ?? CancellationToken.None);
                }
            }
            else if (!e.ToString().StartsWith("TypeError: NetworkError"))
                Console.WriteLine(
                    $"Failed to send request {request.Method} {BaseAddress}{request.RequestUri} ({Util.BytesToString(request.Content?.Headers.ContentLength ?? 0)}):\n{e}");

            throw;
        }
#if SYNC_HTTPCLIENT
        finally {
            _rateLimitSemaphore.Release();
        }
#endif

        // Console.WriteLine($"Sending {request.Method} {request.RequestUri} ({Util.BytesToString(request.Content?.Headers.ContentLength ?? 0)}) -> {(int)responseMessage.StatusCode} {responseMessage.StatusCode} ({Util.BytesToString(responseMessage.GetContentLength())}, WAIT={swWait.ElapsedMilliseconds}ms, EXEC={swExec.ElapsedMilliseconds}ms)");
        if (LogRequests)
            Console.WriteLine("Received " + responseMessage.Summarise(includeHeaders: true, includeContentIfText: false, hideHeaders: [
                "Server",
                "Date",
                "Transfer-Encoding",
                "Connection",
                "Vary",
                "Content-Length",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Headers",
                "Access-Control-Expose-Headers",
                "Cache-Control",
                "Cross-Origin-Resource-Policy",
                "X-Content-Security-Policy",
                "Referrer-Policy",
                "X-Robots-Tag",
                "Content-Security-Policy"
            ]));

        return responseMessage;
    }

    public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken = default) {
        var responseMessage = await SendUnhandledAsync(request, cancellationToken);
        if (responseMessage.IsSuccessStatusCode) return responseMessage;

        //retry on gateway timeout
        // if (responseMessage.StatusCode == HttpStatusCode.GatewayTimeout) {
        // request.ResetSendStatus();
        // return await SendAsync(request, cancellationToken);
        // }

        //error handling
        var content = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
        if (content.Length == 0)
            throw new DataException("Content was empty");
        // throw new MatrixException() {
        // ErrorCode = "M_UNKNOWN",
        // Error = "Unknown error, server returned no content"
        // };

        // if (!content.StartsWith('{')) throw new InvalidDataException("Encountered invalid data:\n" + content);
        if (!content.TrimStart().StartsWith('{')) {
            responseMessage.EnsureSuccessStatusCode();
            throw new InvalidDataException("Encountered invalid data:\n" + content);
        }
        //we have a matrix error

        throw new Exception("Unknown http exception");
        // MatrixException? ex;
        // try {
        //     ex = JsonSerializer.Deserialize<MatrixException>(content);
        // }
        // catch (JsonException e) {
        //     throw new LibMatrixException() {
        //         ErrorCode = "M_INVALID_JSON",
        //         Error = e.Message + "\nBody:\n" + await responseMessage.Content.ReadAsStringAsync(cancellationToken)
        //     };
        // }
        //
        // Debug.Assert(ex != null, nameof(ex) + " != null");
        // ex.RawContent = content;
        // // Console.WriteLine($"Failed to send request: {ex}");
        // if (ex.RetryAfterMs is null) throw ex!;
        // //we have a ratelimit error
        // await Task.Delay(ex.RetryAfterMs.Value, cancellationToken);
        request.ResetSendStatus();
        return await SendAsync(request, cancellationToken);
    }

    // GetAsync
    public Task<HttpResponseMessage> GetAsync([StringSyntax("Uri")] string? requestUri, CancellationToken? cancellationToken = null) =>
        SendAsync(new HttpRequestMessage(HttpMethod.Get, requestUri), cancellationToken ?? CancellationToken.None);

    // GetFromJsonAsync
    public async Task<T?> TryGetFromJsonAsync<T>(string requestUri, JsonSerializerOptions? options = null, CancellationToken cancellationToken = default) {
        try {
            return await GetFromJsonAsync<T>(requestUri, options, cancellationToken);
        }
        catch (JsonException e) {
            Console.WriteLine($"Failed to deserialize response from {requestUri}: {e.Message}");
            return default;
        }
        catch (HttpRequestException e) {
            Console.WriteLine($"Failed to get {requestUri}: {e.Message}");
            return default;
        }
    }

    public async Task<T> GetFromJsonAsync<T>(string requestUri, JsonSerializerOptions? options = null, CancellationToken cancellationToken = default) {
        options = GetJsonSerializerOptions(options);
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var response = await SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);

        return await JsonSerializer.DeserializeAsync<T>(responseStream, options, cancellationToken) ??
               throw new InvalidOperationException("Failed to deserialize response");
    }

    // GetStreamAsync
    public async Task<Stream> GetStreamAsync(string requestUri, CancellationToken cancellationToken = default) {
        var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var response = await SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStreamAsync(cancellationToken);
    }

    public async Task<HttpResponseMessage> PutAsJsonAsync<T>([StringSyntax(StringSyntaxAttribute.Uri)] string? requestUri, T value, JsonSerializerOptions? options = null,
        CancellationToken cancellationToken = default) where T : notnull {
        options = GetJsonSerializerOptions(options);
        var request = new HttpRequestMessage(HttpMethod.Put, requestUri);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Content = new StringContent(JsonSerializer.Serialize(value, value.GetType(), options),
            Encoding.UTF8, "application/json");
        return await SendAsync(request, cancellationToken);
    }

    public async Task<HttpResponseMessage> PostAsJsonAsync<T>([StringSyntax(StringSyntaxAttribute.Uri)] string? requestUri, T value, JsonSerializerOptions? options = null,
        CancellationToken cancellationToken = default) where T : notnull {
        options ??= new JsonSerializerOptions();
        // options.Converters.Add(new JsonFloatStringConverter());
        // options.Converters.Add(new JsonDoubleStringConverter());
        // options.Converters.Add(new JsonDecimalStringConverter());
        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Content = new StringContent(JsonSerializer.Serialize(value, value.GetType(), options),
            Encoding.UTF8, "application/json");
        return await SendAsync(request, cancellationToken);
    }

    public async IAsyncEnumerable<T?> GetAsyncEnumerableFromJsonAsync<T>([StringSyntax(StringSyntaxAttribute.Uri)] string? requestUri, JsonSerializerOptions? options = null) {
        options = GetJsonSerializerOptions(options);
        var res = await GetAsync(requestUri);
        options.PropertyNameCaseInsensitive = true;
        var result = JsonSerializer.DeserializeAsyncEnumerable<T>(await res.Content.ReadAsStreamAsync(), options);
        await foreach (var resp in result) yield return resp;
    }

    public static async Task<bool> CheckSuccessStatus(string url) {
        //cors causes failure, try to catch
        try {
            var resp = await Client.GetAsync(url);
            return resp.IsSuccessStatusCode;
        }
        catch (Exception e) {
            Console.WriteLine($"Failed to check success status: {e.Message}");
            return false;
        }
    }

    public async Task<HttpResponseMessage> PostAsync(string uri, HttpContent? content, CancellationToken cancellationToken = default) {
        var request = new HttpRequestMessage(HttpMethod.Post, uri) {
            Content = content
        };
        return await SendAsync(request, cancellationToken);
    }

    public async Task<HttpResponseMessage> DeleteAsync(string url) {
        var request = new HttpRequestMessage(HttpMethod.Delete, url);
        return await SendAsync(request);
    }

    public async Task<HttpResponseMessage> DeleteAsJsonAsync<T>(string url, T payload) {
        var request = new HttpRequestMessage(HttpMethod.Delete, url) {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        return await SendAsync(request);
    }

    public async Task<HttpResponseMessage> PatchAsJsonAsync<T>(string url, T payload) {
        var request = new HttpRequestMessage(new HttpMethod("PATCH"), url) {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        return await SendAsync(request);
    }
}
#endif