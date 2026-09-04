using System.Diagnostics;
using System.Net.Http.Json;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.Gateway;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Internal;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class PresenceTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime
{
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;

    public async ValueTask InitializeAsync()
    {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
    }

    [Fact]
    public async Task CanSendCustomPresence()
    {
        Client.Gateway.OnceGatewayMessage.Add(async payload =>
        {
            if (payload is { Opcode: GatewayOpcode.S2CDispatch, DispatchEventType: "READY" })
            {
                _testOutputHelper.WriteLine("Sending presence...");

                var presencePayload = new JsonObject()
                {
                    { "status", "online" },
                    { "since", 0 },
                    { "afk", false },
                    { "activities", new JsonArray() {
                            new JsonObject() {
                                { "name", "Custom Status" },
                                { "type", 4 },
                                { "state", "meowmeow custom status meow meow" },
                                { "timestamps", new JsonObject() {
                                        { "end", 1788544741128 }
                                    }
                                },
                                { "emoji", null },
                                { "metadata", new JsonObject() }
                            }
                        }
                    }
                };

                await Client.Gateway.RawClientWebSocket.SendAsync(JsonSerializer.SerializeToUtf8Bytes(new GatewayPayload()
                {
                    Opcode = GatewayOpcode.C2SPresenceUpdate,
                    EventData = presencePayload.ToJsonNode().AsObject()
                }), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
                _testOutputHelper.WriteLine("Sent presence payload...");
                return true;
            }

            _testOutputHelper.WriteLine("Received message: {0}", payload.ToJson(indent: false));
            return false;
        });
        // Client.Gateway.TraceGatewayMessages = true;
        await Client.Gateway.Connect();
        try
        {
            await Client.Gateway.Start();
        }
        catch (Exception e)
        {
            Assert.True(Client.Gateway.RawClientWebSocket.State == WebSocketState.Open, $"Client.Gateway.RawClientWebSocket.State is {Client.Gateway.RawClientWebSocket.State}: {Client.Gateway.RawClientWebSocket.CloseStatus}/{Client.Gateway.RawClientWebSocket.CloseStatusDescription}");
        }
    }
}