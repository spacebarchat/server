using Spacebar.Sdk.Core;

namespace Spacebar.Tests.Abstractions;

public class UserAbstraction(Config _config, SpacebarClientProviderService _clientProvider) {
    public async Task<AuthenticatedSpacebarClient> GetFreshUser(bool withAutojoinGuilds = false) {
        var ua = await _clientProvider.GetUnauthenticatedClientAsync(_config.TestInstance);
        var tokenResponse = await ua.RegisterAsync(new() {
            Email = $"{Guid.NewGuid().ToString()}@{Guid.NewGuid().ToString()}.tld",
            Username = Guid.NewGuid().ToString(),
            Password = Guid.NewGuid().ToString(),
            DateOfBirth = new(),
            Consent = true
        });
        var client = await _clientProvider.GetAuthenticatedClientAsync(_config.TestInstance, tokenResponse.Token);

        if (!withAutojoinGuilds) {
            
        }

        return client;
    }
    
}