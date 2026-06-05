using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests.Meta;

public class UserAbstractionTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly UserAbstraction _config = fixture.GetService<UserAbstraction>(testOutputHelper) ?? throw new InvalidOperationException($"Failed to get {nameof(UserAbstraction)}");
    
    [Fact]
    public async Task CanGetUser() {
        var res = await _config.GetFreshUser();
        Assert.StringNotNullOrWhitespace(res.ApiHttpClient.BaseAddress!.ToString());
    }
}