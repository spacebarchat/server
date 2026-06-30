using System.Text.Json.Nodes;
using Spacebar.Models.Generic;
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
    private static Webhook? Webhook = null!;

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
        
        if (Webhook is null)
            await Channel!.CreateWebhookAsync(new() {
                Name = "meow"
            }).ContinueWith(w => {
                Assert.Equal("meow", w.Result.Name);
                Assert.StringNotNullOrWhitespace(w.Result.Url);
                Webhook = w.Result;
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
    public async Task DeleteWebhookByToken() {
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
        await Assert.HttpSuccess(await Client.ApiHttpClient.DeleteAsync(wh.Url, TestContext.Current.CancellationToken));
    }
    
    [Fact]
    public async Task DeleteWebhook() {
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
        await Assert.HttpSuccess(await Client.ApiHttpClient.DeleteAsync($"webhooks/{wh.Id}", TestContext.Current.CancellationToken));
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
    public async Task SendWebhookMessage() {
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url, new JsonObject() {
            { "content", "meow" }
        });
    }

    [Fact]
    public async Task SendWebhookMessageWithWait() {
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", new JsonObject() {
            { "content", "meow" }
        });
    }

    public static IEnumerable<object?[]> WebhookExecuteCombinations() {
        string[] contents = ["meow", "# hi!!!", "https://spacebar.chat/favicon.ico", "@everyone", "@here"];
        string?[] usernames = [null, "meow"];
        string?[] avatarUrls = [null, "https://spacebar.chat/favicon.ico"];
        bool?[] ttsEnabled = [null, true, false];
        int?[] messageFlags = [
            null,
            0,       // default
            1 << 2,  // SUPPRESS_EMBEDS
            1 << 12, // SUPPRESS_NOTIFICATIONS
            1 << 13  // VOICE_MESSAGE
        ];

        foreach (var content in contents)
            foreach (var username in usernames)
                foreach (var avatarUrl in avatarUrls)
                    foreach (var tts in ttsEnabled)
                        foreach (var flags in messageFlags)
                            yield return [content, username, avatarUrl, tts, flags];
    }

    [Theory]
    [MemberData(nameof(WebhookExecuteCombinations))]
    public async Task SendWebhookMessageWithData(string content, string? username, string? avatarUrl, bool? tts, int? flags) {
        var payload = new JsonObject() {
            { "content", content }
        };
        if (username != null) payload.Add("username", username);
        if (avatarUrl != null) payload.Add("avatar_url", avatarUrl);
        if (tts != null) payload.Add("tts", tts);
        if (flags != null) payload.Add("flags", flags);
        
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", payload);
    }

    [Fact]
    public async Task SendWebhookMessageWithAvatarUrl() {
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", new JsonObject() {
            { "content", "meow" },
            { "avatar_url", "https://spacebar.chat/favicon.ico" }
        });
    }
}