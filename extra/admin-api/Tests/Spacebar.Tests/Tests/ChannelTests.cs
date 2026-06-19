using System.Net.Http.Json;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class ChannelTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;
    private static Guild? Guild { get; set; }
    private static Channel? Channel { get; set; }

    public async ValueTask InitializeAsync() {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
        // ...and a guild
        Guild ??= await Client.CreateGuild(new() {
            Name = "Test guild"
        });
        Channel ??= await Client.GetGuild(Guild.Id).CreateChannelAsync(new() { Name = "meow", Type = 0 });
    }

    [Fact]
    public async Task CreateChannel() {
        Assert.Equal("Test guild", Guild!.Name);
        var channel = await Client!.GetGuild(Guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0 // TODO: this should be the default
        });

        Assert.Equal("test", channel.Name);
    }

    [Fact]
    public async Task GetChannel() {
        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync("channels/" + Channel.Id, TestContext.Current.CancellationToken));

        var channelResp = await res.Content.ReadFromJsonAsync<Channel>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(Channel.Name, channelResp!.Name);
        Assert.Equal(Channel.Id, channelResp!.Id);
    }

    [Fact]
    public async Task SendTyping() {
        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync($"channels/{Channel!.Id}/typing", null, TestContext.Current.CancellationToken));
    }
}