using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class GuildTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    [Fact]
    public async Task CreateGuild() {
        var client = await _userAbstraction.GetSharedUser();
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);
    }
    
    [Fact]
    public async Task GetChannels() {
        var client = await _userAbstraction.GetSharedUser();
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channels = await client.GetGuild(guild.Id).GetChannelsAsync();
        Assert.NotEmpty(channels);
        foreach (var channel in channels) {
            Assert.StringNotNullOrWhitespace(channel.Name);
        }
    }
}