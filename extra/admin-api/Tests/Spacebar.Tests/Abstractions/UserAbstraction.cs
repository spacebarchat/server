using Spacebar.Sdk.Core;

namespace Spacebar.Tests.Abstractions;

public class UserAbstraction(Config _config, SpacebarClientProviderService _clientProvider) {
    public async Task<AuthenticatedSpacebarClient> GetFreshUser(bool withAutojoinGuilds = false) {
        var ua = await _clientProvider.GetUnauthenticatedClientAsync(_config.TestInstance);
        var tokenResponse = await ua.RegisterAsync(new() {
            Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
            Username = Guid.NewGuid().ToString()[..32],
            Password = Guid.NewGuid().ToString(),
            DateOfBirth = new(),
            Consent = true
        });
        var client = await _clientProvider.GetAuthenticatedClientAsync(_config.TestInstance, tokenResponse.Token);

        if (!withAutojoinGuilds) {
            await Task.Delay(1000);
            var leaves = (await client.GetJoinedGuilds()).Select(x => client.GetGuild(x.Id).LeaveAsync()).ToList();
            await Task.WhenAll(leaves);
            await Task.Delay(1000);
        }

        return client;
    }

    private static AuthenticatedSpacebarClient? _authenticatedSpacebarClient;
    public async Task<AuthenticatedSpacebarClient> GetSharedUser() {
        return _authenticatedSpacebarClient ??= await GetFreshUser();
    }
}