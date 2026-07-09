using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Xunit.Microsoft.DependencyInjection;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Fixtures;

public class TestFixture : TestBedFixture {
    protected override void AddServices(IServiceCollection services, IConfiguration configuration) {
        services.AddSingleton(configuration);
        services.AddLogging();
        
        services.AddSingleton<Config>();
        services.AddSingleton<UserAbstraction>();
        
        services.AddSingleton<SpacebarClientWellKnownResolverService>();
        services.AddSingleton<SpacebarClientProviderService>();
        
    }

    protected override ValueTask DisposeAsyncCore()
        => new();

    protected override IEnumerable<TestAppSettings> GetTestAppSettings() {
        yield return new TestAppSettings { Filename = "appsettings.json", IsOptional = true };
        yield return new TestAppSettings { Filename = Environment.GetEnvironmentVariable("TEST_APPSETTINGS_PATH"), IsOptional = true };
    }
}