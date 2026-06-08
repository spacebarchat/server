using Spacebar.Sdk.Core;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class BasicWellKnownTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);

    [Fact]
    public async Task ValidateTestConfig() {
        Assert.NotNull(_config.TestInstance);
        Assert.NotEmpty(_config.TestInstance);
    }

    [Fact]
    public async Task CanReachInstance() => await Assert.SuccessfullyHttpGetAsync($"{_config.TestInstance}/api/v9/ping");

    [Fact]
    public async Task CanGetOldWellknown() {
        await Assert.SuccessfullyHttpGetAsync($"{_config.TestInstance}/.well-known/spacebar");
        await Assert.SuccessfullyHttpGetAsync($"{_config.TestInstance}/api/v9/policies/instance/domains");
    }

    [Fact]
    public async Task CanGetNewWellknown() => await Assert.SuccessfullyHttpGetAsync($"{_config.TestInstance}/.well-known/spacebar/client");

    [Fact]
    public async Task SdkCanGetWellKnown() {
        testOutputHelper.WriteLine("instance: " + _config.TestInstance);
        var res = await _wellKnownResolver.ResolveClientWellKnown(_config.TestInstance);
        Assert.StringNotNullOrWhitespace(res.Api.BaseUrl);
        Assert.StringNotNullOrWhitespace(res.Cdn.BaseUrl);
        Assert.StringNotNullOrWhitespace(res.Gateway.BaseUrl);
        Assert.NotEmpty(res.Api.ApiVersions.Active);
        Assert.StringNotNullOrWhitespace(res.Api.ApiVersions.Default);
        Assert.NotEmpty(res.Gateway.Compression);
        Assert.NotEmpty(res.Gateway.Encoding);
    }
}