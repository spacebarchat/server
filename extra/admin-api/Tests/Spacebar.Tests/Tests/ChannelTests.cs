using System.Net.Http.Json;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class ChannelTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetService<Config>(testOutputHelper) ?? throw new InvalidOperationException($"Failed to get {nameof(Config)}");

    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetService<SpacebarClientWellKnownResolverService>(testOutputHelper) ??
                                                                                 throw new InvalidOperationException(
                                                                                     $"Failed to get {nameof(SpacebarClientWellKnownResolverService)}");

    private readonly SpacebarClientProviderService _clientProvider = fixture.GetService<SpacebarClientProviderService>(testOutputHelper) ??
                                                                     throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");

    private readonly UserAbstraction _userAbstraction = fixture.GetService<UserAbstraction>(testOutputHelper) ??
                                                        throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");
    
    [Fact]
    public async Task CreateChannel() {
        var client = await _userAbstraction.GetFreshUser();
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channel = await client.GetGuild(guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });
        
        Assert.Equal("test", channel.Name);
    }

    [Fact]
    public async Task GetChannel() {
        var client = await _userAbstraction.GetFreshUser();
        var guild = await client.CreateGuild(new() {
            Name = "Test guild"
        });
        
        Assert.Equal("Test guild", guild.Name);

        var channel = await client.GetGuild(guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });
        
        Assert.Equal("test", channel.Name);

        var res = await client.ApiHttpClient.GetAsync("channels/" + channel.Id, TestContext.Current.CancellationToken);
        await Assert.HttpSuccess(res);
        
        var channelResp = await res.Content.ReadFromJsonAsync<Channel>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(channel.Name, channelResp!.Name);
        Assert.Equal(channel.Id, channelResp!.Id);
        
    }
}