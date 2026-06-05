using System.Diagnostics;
using System.Net.Http.Json;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using ArcaneLibs.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Spacebar.Models.Api;
using Spacebar.Models.Gateway;
using Spacebar.Models.Generic;

namespace Spacebar.Sdk.Core;

public class UnauthenticatedSpacebarClient(ILogger<UnauthenticatedSpacebarClient> logger, SpacebarClientWellKnown wellKnown) {
    public async Task<LoginResponse> LoginAsync(LoginRequest request) {
        // TODO: rebase
        using var hc = new HttpClient();
        var resp = await hc.PostAsJsonAsync(new Uri(wellKnown.Api.GetApiBaseUrl(), "auth/login"), request);
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<LoginResponse>())!;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request) {
        // TODO: rebase
        using var hc = new HttpClient();
        var resp = await hc.PostAsJsonAsync(new Uri(wellKnown.Api.GetApiBaseUrl(), "auth/register"), request);
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<RegisterResponse>())!;
    }
}

public class AuthenticatedSpacebarClient {
    private readonly ILogger<AuthenticatedSpacebarClient> _logger;

    public AuthenticatedSpacebarClient(ILogger<AuthenticatedSpacebarClient> logger, IServiceProvider sp, SpacebarClientWellKnown wellKnown, string token) {
        _logger = logger;
        ApiHttpClient = new HttpClient() {
            BaseAddress = wellKnown.Api.GetApiBaseUrl()
        };
        ApiHttpClient.DefaultRequestHeaders.Authorization = new("Bearer", token);
        Gateway = new(sp.GetRequiredService<ILogger<AuthenticatedSpacebarGatewayClient>>(), wellKnown, token);
        ClientWellKnown = wellKnown;
    }

    public HttpClient ApiHttpClient { get; set; }
    public AuthenticatedSpacebarGatewayClient Gateway { get; set; }
    public SpacebarClientWellKnown ClientWellKnown { get; set; }

    // TODO: write a proper full user model...
    public async Task<PartialUser> GetCurrentUser() {
        var resp = await ApiHttpClient.GetAsync("users/@me");
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<PartialUser>())!;
    }

    ~AuthenticatedSpacebarClient() {
        ApiHttpClient.Dispose();
    }

    public SpacebarClientChannel GetChannel(long channelId) => new(this, channelId);
    public SpacebarClientGuild GetGuild(long guildId) => new(this, guildId);

    public async Task<Guild> CreateGuild(CreateGuildRequest req) {
        var resp = await ApiHttpClient.PostAsJsonAsync("guilds", req, new JsonSerializerOptions() {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<Guild>())!;
    }

    public async Task<List<Guild>> GetJoinedGuilds() {
        var resp = await ApiHttpClient.GetAsync("users/@me/guilds");
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<List<Guild>>())!;
    }
}

public class SpacebarClientChannel(AuthenticatedSpacebarClient client, long channelId) {
    public long Id => channelId;

    public async Task<List<Message>> GetMessagesAsync(long? around = null, long? before = null, long? after = null, int limit = 50) {
        var uri = $"channels/{channelId}/messages?limit={limit}";
        if (around.HasValue) uri += $"&around={around.Value}";
        if (before.HasValue) uri += $"&before={before.Value}";
        if (after.HasValue) uri += $"&after={after.Value}";

        var resp = await client.ApiHttpClient.GetAsync(uri);
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        var data = await resp.Content.ReadFromJsonAsync<List<JsonObject>>();
        Console.WriteLine(data.ToJson(indent: false, ignoreNull: true));
        return data.Select(x => x.Deserialize<Message>()).ToList();
    }

    public async Task<Webhook> CreateWebhookAsync(CreateWebhookRequest req) {
        var resp = await client.ApiHttpClient.PostAsJsonAsync($"channels/{channelId}/webhooks", req, new JsonSerializerOptions() {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<Webhook>())!;
    }

    public async Task<List<Webhook>> GetWebhooksAsync() {
        var resp = await client.ApiHttpClient.GetAsync($"channels/{channelId}/webhooks");
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<List<Webhook>>())!;
    }
}

public class SpacebarClientGuild(AuthenticatedSpacebarClient client, long guildId) {
    public long Id => guildId;

    public async Task<List<Channel>> GetChannelsAsync() {
        var uri = $"guilds/{guildId}/channels";

        var resp = await client.ApiHttpClient.GetAsync(uri);
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        var data = await resp.Content.ReadFromJsonAsync<List<JsonObject>>();
        Console.WriteLine(data.ToJson(indent: false, ignoreNull: true));
        return data.Select(x => x.Deserialize<Channel>()).ToList();
    }

    public async Task<Channel> CreateChannelAsync(CreateChannelRequest req) {
        var resp = await client.ApiHttpClient.PostAsJsonAsync($"guilds/{guildId}/channels", req, new JsonSerializerOptions() {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
        return (await resp.Content.ReadFromJsonAsync<Channel>())!;
    }

    public async Task LeaveAsync(bool lurking = false) {
        var req = new HttpRequestMessage(HttpMethod.Delete, $"users/@me/guilds/{guildId}") {
            Content = new StringContent(new JsonObject() {
                { "lurking", lurking }
            }.ToJsonString(new JsonSerializerOptions() {
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            }))
        };
        var resp = await client.ApiHttpClient.SendAsync(req);
        // TODO: abstract out
        if (!resp.IsSuccessStatusCode) throw SpacebarApiException.FromJson((await resp.Content.ReadFromJsonAsync<JsonObject>())!);
    }
}

public class AuthenticatedSpacebarGatewayClient(ILogger<AuthenticatedSpacebarGatewayClient> logger, SpacebarClientWellKnown wellKnown, string token) {
    public ClientWebSocket RawClientWebSocket = new();
    public int Sequence;
    public bool TraceGatewayMessages = false;

    public IdentifyRequest IdentifyData { get; } = new() {
        Intents = (GatewayIntentFlags?)0xFFFFFFFF, // too lazy to do math, just gimme everything
        Capabilities = 0
    };

    public List<Func<GatewayPayload, Task>> OnGatewayMessage { get; } = [];
    public List<Func<GatewayPayload, Task<bool>>> OnceGatewayMessage { get; } = [];

    public async Task Connect() {
        if (RawClientWebSocket.State is WebSocketState.Connecting or WebSocketState.Open) return;
        Sequence = 0;
        await RawClientWebSocket.ConnectAsync(new Uri(wellKnown.Gateway.BaseUrl).AddQuery("encoding", "json"), CancellationToken.None);
    }

    public async Task Start() {
        await foreach (var msg in _runReceiveLoop()) {
            // logger.LogInformation("Got gateway message: {msg}", msg);
            if (msg.Opcode == GatewayOpcode.S2CHello) {
                _ = _runHeartbeatLoop(msg.GetData<HelloResponse>()!.HeartbeatInterval).ContinueWith(ct => {
                    logger.LogWarning("Heartbeat loop exited!");
                    if (ct.IsFaulted) throw ct.Exception;
                });
                IdentifyData.Token = token;
                await RawClientWebSocket.SendAsync(JsonSerializer.SerializeToUtf8Bytes(new GatewayPayload() {
                    Opcode = GatewayOpcode.C2SIdentify, // Identify
                    EventData = IdentifyData.ToJsonNode().AsObject()
                }), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
            }
            else if (msg.Opcode == GatewayOpcode.S2CHeartbeatAck) {
                logger.LogInformation("Got heartbeat ACK from server!");
            }

            await Task.WhenAll(OnGatewayMessage.Select(async x => {
                try {
                    await x(msg);
                }
                catch (Exception e) {
                    logger.LogError("OnGatewayMessage callback failed: {e}", e);
                }
            }).ToArray());
            foreach (var t in OnceGatewayMessage.Select((Func<GatewayPayload, Task<bool>> Callback, Task<bool> WasHandled) (cb) => (cb, cb(msg))).ToList()) {
                try {
                    var handled = await t.WasHandled;
                    if (handled) {
                        OnceGatewayMessage.Remove(t.Callback);
                    }
                }
                catch (Exception e) {
                    logger.LogError("OnceGatewayMessage callback failed: {e}", e);
                }
            }
        }
    }

    private async Task _runHeartbeatLoop(int interval) {
        while (RawClientWebSocket.State < WebSocketState.Closed) {
            await RawClientWebSocket.SendAsync(JsonSerializer.SerializeToUtf8Bytes(new GatewayPayload() {
                Opcode = GatewayOpcode.C2SQoSHeartbeat, // QoS Heartbeat
                EventData = new QoSHeartbeatRequest() {
                    Sequence = Sequence,
                    QoSPayload = new() {
                        Active = true,
                        Reasons = ["foregrounded"],
                        Version = 27
                    }
                }.ToJsonNode().AsObject()
            }), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
            await Task.Delay(interval);
        }
    }

    private const int ReceiveBufferSize = 2 * 1024 * 1024;

    private async IAsyncEnumerable<GatewayPayload> _runReceiveLoop() {
        List<byte> messageParts = [];
        List<(string Name, TimeSpan Elapsed)> trace = [];
        var buffer = new byte[ReceiveBufferSize];
        int idx = 0;

        while (RawClientWebSocket.State < WebSocketState.Closed) {
            var sw = Stopwatch.StartNew();

            var msg = await RawClientWebSocket.ReceiveAsync(buffer, CancellationToken.None);
            trace.Add(($"RCV.{idx}", sw.GetElapsedAndRestart()));

            Console.WriteLine($"Websocket message chunk read: {msg.MessageType} {msg.Count} {msg.EndOfMessage}");
            messageParts.AddRange(msg.Count < ReceiveBufferSize ? buffer[..msg.Count] : buffer);
            trace.Add(($"STO.{idx}({msg.Count})", sw.GetElapsedAndRestart()));
            idx++;

            if (msg.EndOfMessage) {
                Console.WriteLine($"Got message, deserialising {messageParts.Count} bytes...");
                var fullMsg = messageParts.ToArray();
                trace.Add(($"LD({messageParts.Count})", sw.GetElapsedAndRestart()));

                var d = JsonSerializer.Deserialize<GatewayPayload>(fullMsg);
                trace.Add(($"LJS({fullMsg.Length})", sw.GetElapsedAndRestart()));

                Console.WriteLine($"Received gateway message #{d.Sequence}: {(byte)d.Opcode}/{d.Opcode.ToString().Replace("S2C", "")} {d.DispatchEventType}");
                yield return d ?? throw new InvalidDataException("Gateway message deserialisation returned null?");
                trace.Add(($"YLD", sw.GetElapsedAndRestart()));

                if (TraceGatewayMessages) {
                    Console.WriteLine("Yielded message!");
                    Console.WriteLine("Trace:");
                    foreach (var t in trace)
                        Console.WriteLine($" - {t.Name}: {t.Elapsed}");
                }

                messageParts.Clear();
                trace.Clear();
                trace.Add(($"RST", sw.GetElapsedAndRestart()));
            }
        }
    }

    ~AuthenticatedSpacebarGatewayClient() {
        RawClientWebSocket.Dispose();
    }
}