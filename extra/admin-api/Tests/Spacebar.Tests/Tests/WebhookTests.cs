using System.Text.Json.Nodes;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class WebhookTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client = null!;
    private static SpacebarClientGuild? Guild;

    private static SpacebarClientChannel? Channel = null!;

    public async ValueTask InitializeAsync() {
        Client = await _userAbstraction.GetSharedUser();

        if (Guild is null)
            await Client.CreateGuild(new() {
                Name = "Test guild"
            }).ContinueWith(g => {
                Assert.Equal("Test guild", g.Result.Name);
                Guild = Client.GetGuild(g.Result.Id);
            });

        if (Channel is null)
            await Guild!.CreateChannelAsync(new() {
                Name = "test",
                Type = 0
            }).ContinueWith(c => {
                Assert.Equal("test", c.Result.Name);
                Channel = Client.GetChannel(c.Result.Id);
            });
    }

    [Fact]
    public async Task CreateWebhook() {
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
    }

    [Fact]
    public async Task CreateMultipleWebhooks() {
        var channel = await Guild!.CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });

        Assert.Equal("test", channel.Name);

        var cChannel = Client.GetChannel(channel.Id);

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
        var wh = await Channel!.CreateWebhookAsync(new() {
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
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);

        await Assert.SuccessfullyHttpPostAsJsonAsync(wh.Url, new JsonObject() {
            { "content", "meow" }
        });
    }
}