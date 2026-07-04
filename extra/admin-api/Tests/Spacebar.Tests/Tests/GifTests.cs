using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Api;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Internal;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class GifTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;

    public async ValueTask InitializeAsync() {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
    }

    public static IEnumerable<object[]> GifSearchTestMatrix() {
        foreach (var query in (string[])["meow", "meowmeow"])
            foreach (var provider in (string[])["tenor"])
                yield return [query, provider];
    }

    [Theory, MemberData(nameof(GifSearchTestMatrix))]
    public async Task SearchGifs(string query, string provider) {
        var resp = await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync($"gifs/search?q={query}&provider={provider}", TestContext.Current.CancellationToken));
        var respContent = await resp.Content.ReadFromJsonAsync<List<GifItem>>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.True(respContent!.Count > 0, "respContent.Count > 0");
        Assert.All(respContent, gif => {
            Assert.StringNotNullOrWhitespace(gif.Id);
            Assert.StringNotNullOrWhitespace(gif.GifSource);
            Assert.StringNotNullOrWhitespace(gif.Preview);
            Assert.StringNotNullOrWhitespace(gif.Source);
            Assert.StringNotNullOrWhitespace(gif.Url);
            Assert.NotEqual(0, gif.Width);
            Assert.NotEqual(0, gif.Height);
        });
    }
}