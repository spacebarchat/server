using System.Net.Http.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class GuildTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
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
    public async Task CreateGuild() {
        var guild = await Client.CreateGuild(new() {
            Name = "Test guild"
        });

        Assert.Equal("Test guild", guild.Name);
    }

    [Fact]
    public async Task GetChannels() {
        var guild = await Client.CreateGuild(new() {
            Name = "Test guild"
        });

        Assert.Equal("Test guild", guild.Name);

        var channels = await Client.GetGuild(guild.Id).GetChannelsAsync();
        Assert.NotEmpty(channels);
        foreach (var channel in channels) {
            Assert.StringNotNullOrWhitespace(channel.Name);
        }
    }

    [Fact]
    public async Task SetChannelOrder() {
        var cg = Client.GetGuild(Guild.Id);

        await Task.WhenAll(Enumerable.Range(1, 10).Select(x => cg.CreateChannelAsync(new() {
            Name = Guid.NewGuid().ToString(),
            Type = 0
        })));
        
        var guildChannels = await cg.GetChannelsAsync();
        // testOutputHelper.WriteLine(guildChannels.Select(x=>(x.Id, x.Name, x.Position)).ToJson(includeFields: true));

        var payload = new JsonArray();

        var i = 0;
        foreach (var c in guildChannels.OrderBy(x=>x.Name)) {
            payload.Add(new JsonObject() {
                {"id", c.Id.ToString()},
                {"position", i++}
            });    
        }

        await Assert.HttpSuccess(await Client.ApiHttpClient.PatchAsJsonAsync($"guilds/{cg.Id}/channels", payload, cancellationToken: TestContext.Current.CancellationToken));
        
        var newGuildChannels = await cg.GetChannelsAsync();
        // testOutputHelper.WriteLine(newGuildChannels.Select(x=>(x.Id, x.Name, x.Position)).ToJson(includeFields: true));
        Assert.Equal(guildChannels.OrderBy(x=>x.Name), newGuildChannels, (a, b) => a.Id == b.Id);
    }
}