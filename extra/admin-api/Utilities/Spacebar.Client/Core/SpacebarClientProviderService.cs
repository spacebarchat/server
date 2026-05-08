using ArcaneLibs.Collections;

namespace Spacebar.Client.Core;

public class SpacebarClientProviderService(ILogger<SpacebarClientProviderService> logger, IServiceProvider serviceProvider, SpacebarClientWellKnownResolverService clientWellKnownResolver) {
    private static readonly SemaphoreCache<UnauthenticatedSpacebarClient> UnauthenticatedClientCache = new();
    private static readonly SemaphoreCache<AuthenticatedSpacebarClient> AuthenticatedClientCache = new();

    public async Task<UnauthenticatedSpacebarClient> GetUnauthenticatedClientAsync(string serverName) {
        return await UnauthenticatedClientCache.GetOrAdd(serverName, async () => {
            logger.LogInformation("Creating a new unauthenticated client for {serverName}!", serverName);
            var clientLogger = serviceProvider.GetRequiredService<ILogger<UnauthenticatedSpacebarClient>>();
            var wellKnown = await clientWellKnownResolver.ResolveClientWellKnown(serverName);
            return new UnauthenticatedSpacebarClient(clientLogger, wellKnown);
        });
    }
    
    public async Task<AuthenticatedSpacebarClient> GetAuthenticatedClientAsync(string serverName, string accessToken) {
        return await AuthenticatedClientCache.GetOrAdd(serverName, async () => {
            logger.LogInformation("Creating a new authenticated client for {serverName}!", serverName);
            var clientLogger = serviceProvider.GetRequiredService<ILogger<AuthenticatedSpacebarClient>>();
            var wellKnown = await clientWellKnownResolver.ResolveClientWellKnown(serverName);
            return new AuthenticatedSpacebarClient(clientLogger, serviceProvider, wellKnown, accessToken);
        });
    }
}