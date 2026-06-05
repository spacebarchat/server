using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class WebhookTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetService<Config>(testOutputHelper) ?? throw new InvalidOperationException($"Failed to get {nameof(Config)}");

    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetService<SpacebarClientWellKnownResolverService>(testOutputHelper) ??
                                                                                 throw new InvalidOperationException(
                                                                                     $"Failed to get {nameof(SpacebarClientWellKnownResolverService)}");

    private readonly SpacebarClientProviderService _clientProvider = fixture.GetService<SpacebarClientProviderService>(testOutputHelper) ??
                                                                     throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");

    private readonly UserAbstraction _userAbstraction = fixture.GetService<UserAbstraction>(testOutputHelper) ??
                                                        throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");
    
    [Fact]
    public async Task CreateWebhook() {
        var client = await _userAbstraction.GetFreshUser(withAutojoinGuilds: true);
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channel = await client.GetGuild(guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });
        
        Assert.Equal("test", channel.Name);

        var cChannel = client.GetChannel(channel.Id);
        var wh = await cChannel.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
    }
    
    [Fact]
    public async Task CreateMultipleWebhooks() {
        var client = await _userAbstraction.GetFreshUser(withAutojoinGuilds: true);
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channel = await client.GetGuild(guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });
        
        Assert.Equal("test", channel.Name);

        var cChannel = client.GetChannel(channel.Id);

        var count = Random.Shared.Next(10);
        testOutputHelper.WriteLine($"Creating {count} webhooks...");
        await Task.WhenAll(Enumerable.Range(0, count).Select(i => cChannel.CreateWebhookAsync(new() {
            Name = "meow" + i
        })).ToList());

        var wh = await cChannel.GetWebhooksAsync();
        Assert.All(wh, h => Assert.StartsWith("meow", h.Name));
        Assert.All(wh, h => Assert.StringNotNullOrWhitespace(h.Url));
    }

    [Fact]
    public async Task SendWebhookMessageWithWait() {
        var client = await _userAbstraction.GetFreshUser(withAutojoinGuilds: true);
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channel = await client.GetGuild(guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });
        
        Assert.Equal("test", channel.Name);

        var cChannel = client.GetChannel(channel.Id);
        var wh = await cChannel.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);

        await Assert.SuccessfullyHttpPostAsJsonAsync(wh.Url + "?wait=true", new JsonObject() {
            { "content", "meow" }
        });
    }
    
    [Fact]
    public async Task SendWebhookMessage() {
        var client = await _userAbstraction.GetFreshUser(withAutojoinGuilds: true);
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channel = await client.GetGuild(guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });
        
        Assert.Equal("test", channel.Name);

        var cChannel = client.GetChannel(channel.Id);
        var wh = await cChannel.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);

        await Assert.SuccessfullyHttpPostAsJsonAsync(wh.Url, new JsonObject() {
            { "content", "meow" }
        });
    }
}