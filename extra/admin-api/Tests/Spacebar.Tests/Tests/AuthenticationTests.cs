using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.Api;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;
using Xunit.Sdk;

namespace Spacebar.Tests.Tests;

public class AuthenticationTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture) {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);

    [Fact]
    public async Task RegisterUser() {
        var res = await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/register", new RegisterRequest() {
            Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
            Username = Guid.NewGuid().ToString(),
            Password = Guid.NewGuid().ToString(),
            DateOfBirth = new(),
            Consent = true
        });
        await Assert.HttpSuccess(res);
    }

    [Fact]
    public async Task RegisterUsersConcurrent() {
        testOutputHelper.WriteLine($"Registering {_config.RegisterConcurrentCount} users concurrently...");
        var tasks = Enumerable.Range(0, _config.RegisterConcurrentCount).Select(async _ => {
            var sw = Stopwatch.StartNew();
            var rr = new RegisterRequest() {
                Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
                Username = Guid.NewGuid().ToString(),
                Password = "password",
                DateOfBirth = new(),
                Consent = true
            };
            
            var result = await Assert.SuccessfullyHttpPostAsJsonAsync($"{_config.TestInstance}/api/v9/auth/register", rr);
            testOutputHelper.WriteLine($"Registered {rr.Email} in {sw.Elapsed}...");
            return (rr, result);
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