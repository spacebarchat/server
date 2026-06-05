using System.Net.Http.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.Api;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class AuthenticationTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetService<Config>(testOutputHelper) ?? throw new InvalidOperationException($"Failed to get {nameof(Config)}");

    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetService<SpacebarClientWellKnownResolverService>(testOutputHelper) ??
                                                                                 throw new InvalidOperationException(
                                                                                     $"Failed to get {nameof(SpacebarClientWellKnownResolverService)}");

    private readonly SpacebarClientProviderService _clientProvider = fixture.GetService<SpacebarClientProviderService>(testOutputHelper) ??
                                                                     throw new InvalidOperationException($"Failed to get {nameof(SpacebarClientProviderService)}");

    [Fact]
    public async Task RegisterUser() {
        var res = await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/register", new RegisterRequest() {
            Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
            Username = Guid.NewGuid().ToString(),
            Password = Guid.NewGuid().ToString(),
            DateOfBirth = new(),
            Consent = true
        });
    }

    [Fact]
    public async Task ConcurrentRegister50Users() {
        var tasks = Enumerable.Range(0, 50).Select(async _ => {
            var rr = new RegisterRequest() {
                Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
                Username = Guid.NewGuid().ToString(),
                Password = "password",
                DateOfBirth = new(),
                Consent = true
            };
            return (rr, await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/register", rr));
        }).ToList();
        await Task.WhenAll(tasks);

        testOutputHelper.WriteLine("Waiting for server to settle...");
        await Task.Delay(2500, TestContext.Current.CancellationToken);
        
        testOutputHelper.WriteLine("Cleaning up users...");
        var cleanupTasks = tasks.Select(x => x.Result).Select(async res => {
            var resp = await res.Item2.Content.ReadFromJsonAsync<RegisterResponse>();
            var c = await _clientProvider.GetAuthenticatedClientAsync(_config.TestInstance, resp.Token);
            var dresp = (await c.ApiHttpClient.PostAsJsonAsync("/api/v9/users/@me/delete", new JsonObject() {
                { "password", "password" }
            }, cancellationToken: TestContext.Current.CancellationToken));
            // TODO: figure out why this fails with "invalid password"
            if (!dresp.IsSuccessStatusCode)
                testOutputHelper.WriteLine("Failed to delete user: " + await AssertHttpExtensions.GetFormattedErrorDetails(dresp));
        }).ToList();
        await Task.WhenAll(cleanupTasks);
    }

    [Fact]
    public async Task LoginUser() {
        var rr = new RegisterRequest() {
            Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
            Username = Guid.NewGuid().ToString(),
            Password = Guid.NewGuid().ToString(),
            DateOfBirth = new(),
            Consent = true
        };
        var rrRes = await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/register", rr);
        var loginRes = await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/login", new LoginRequest() {
            Login = rr.Email,
            Password = rr.Password
        });
    }

    [Fact]
    public async Task WhoAmI() {
        var rr = new RegisterRequest() {
            Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
            Username = Guid.NewGuid().ToString(),
            Password = Guid.NewGuid().ToString(),
            DateOfBirth = new(),
            Consent = true
        };
        var rrRes = await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/register", rr);
        var res = await rrRes.Content.ReadFromJsonAsync<RegisterResponse>();
        var client = await _clientProvider.GetAuthenticatedClientAsync(_config.TestInstance, res.Token);
        var waRes = await Assert.HttpSuccess(await client.ApiHttpClient.GetAsync("/api/v9/auth/whoami"));
        // TODO: finish test once model exists
    }
}