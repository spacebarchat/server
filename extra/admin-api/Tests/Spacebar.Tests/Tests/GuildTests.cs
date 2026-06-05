using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class GuildTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetService<Config>(testOutputHelper) ?? throw new InvalidOperationException($"Failed to get {nameof(Config)}");

    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetService<SpacebarClientWellKnownResolverService>(testOutputHelper) ??
                                                                                 throw new InvalidOperationException(
                                                                                     $"Failed to get {nameof(SpacebarClientWellKnownResolverService)}");

    private readonly SpacebarClientProviderService _clientProvider = fixture.GetService<SpacebarClientProviderService>(testOutputHelper) ??
                                                                     throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");

    private readonly UserAbstraction _userAbstraction = fixture.GetService<UserAbstraction>(testOutputHelper) ??
                                                        throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");

    [Fact]
    public async Task CreateGuild() {
        var client = await _userAbstraction.GetFreshUser();
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);
    }
    
    [Fact]
    public async Task GetChannels() {
        var client = await _userAbstraction.GetFreshUser();
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