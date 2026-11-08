using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class InviteTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
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

    public static IEnumerable<object?[]> CreateInviteFields() {
        foreach (var maxAge in (int?[])[null, 100])
            foreach (var maxUses in (int?[])[null, 1, 10])
                foreach (var temporary in (bool?[])[null, true, false])
                    yield return [maxAge, maxUses, temporary];
    }

    [Theory]
    [MemberData(nameof(CreateInviteFields))]
    public async Task CreateChannelInvite(int? maxAge = null, int? maxUses = null, bool? temporary = null) {
        var data = new JsonObject();
        if (maxAge is not null) data["max_age"] = maxAge;
        if (maxUses is not null) data["max_uses"] = maxUses;
        if (temporary is not null) data["temporary"] = temporary;

        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{Channel!.Id}/invites", data, cancellationToken: TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetChannelInvites() {
        await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync($"channels/{Channel!.Id}/invites", cancellationToken: TestContext.Current.CancellationToken));
    }
}