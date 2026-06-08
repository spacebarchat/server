using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Extensions;

public static class TestBedFixtureExtensions {
    extension(TestBedFixture tbf) {
        public T GetRequiredService<T>(ITestOutputHelper toh) {
            return tbf.GetService<T>(toh) ?? throw new InvalidOperationException($"Failed to get service: {typeof(T).FullName}");
        }
    }
}