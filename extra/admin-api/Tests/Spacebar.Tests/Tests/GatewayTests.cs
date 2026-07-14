using System.Diagnostics;
using System.Net.Http.Json;
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

public class GatewayTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;

    public async ValueTask InitializeAsync() {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
    }

    [Fact]
    public async Task CanConnect() {
        await Client.Gateway.Connect();
        await Client.Gateway.Disconnect();
    }

    [Fact]
    public async Task CanReceiveReady() {
        Client.Gateway.OnceGatewayMessage.Add(async payload => {
            if (payload is { Opcode: GatewayOpcode.S2CDispatch, DispatchEventType: "READY" }) {
                _testOutputHelper.WriteLine("Success: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData!.Count);
                await Client.Gateway.Disconnect();
                return true;
            }

            _testOutputHelper.WriteLine("Received message: {0}", payload.ToJson(indent: false));
            return false;
        });
        // Client.Gateway.TraceGatewayMessages = true;
        await Client.Gateway.Connect();
        await Client.Gateway.Start();
    }

    [Fact]
    public async Task CanReceiveReadySupplemental() {
        Client.Gateway.OnceGatewayMessage.Add(async payload => {
            if (payload is { Opcode: GatewayOpcode.S2CDispatch, DispatchEventType: "READY_SUPPLEMENTAL" }) {
                _testOutputHelper.WriteLine("Success: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData!.Count);
                await Client.Gateway.Disconnect();
                return true;
            }

            _testOutputHelper.WriteLine("Received message: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData?.Count);
            return false;
        });
        // Client.Gateway.TraceGatewayMessages = true;
        await Client.Gateway.Connect();
        await Client.Gateway.Start();
    }
    
    
    [Fact]
    public async Task CanReceiveHeartbeatAck() {
        Client.Gateway.OnceGatewayMessage.Add(async payload => {
            if (payload is { Opcode: GatewayOpcode.S2CHeartbeatAck }) {
                _testOutputHelper.WriteLine("Success: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData!.Count);
                await Client.Gateway.Disconnect();
                return true;
            }

            _testOutputHelper.WriteLine("Received message: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData?.Count);
            return false;
        });
        // Client.Gateway.TraceGatewayMessages = true;
        await Client.Gateway.Connect();
        await Client.Gateway.Start();
    }
    
    [Fact]
    public async Task SensibleHello() {
        Client.Gateway.OnceGatewayMessage.Add(async payload => {
            if (payload is { Opcode: GatewayOpcode.S2CHello }) {
                _testOutputHelper.WriteLine("Success: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData!.Count);
                var data = payload.GetData<HelloResponse>();
                await Client.Gateway.Disconnect();
                
                Assert.NotEqual(0, data.HeartbeatInterval);
                Assert.True(data.HeartbeatInterval > 1000, "data.HeartbeatInterval > 1000");
                return true;
            }

            _testOutputHelper.WriteLine("Received message: {0} {1} ({2} data keys)", payload.Opcode, payload.DispatchEventType, payload.EventData?.Count);
            return false;
        });
        // Client.Gateway.TraceGatewayMessages = true;
        await Client.Gateway.Connect();
        await Client.Gateway.Start();
    }

}