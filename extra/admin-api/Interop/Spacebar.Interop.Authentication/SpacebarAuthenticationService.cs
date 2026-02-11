using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using ArcaneLibs.Collections;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.Interop.Authentication;

public class SpacebarAuthenticationService(ILogger<SpacebarAuthenticationService> logger, SpacebarDbContext db, SpacebarAuthenticationConfiguration config) {
    private static readonly ExpiringSemaphoreCache<User> UserCache = new();
    private static readonly ExpiringSemaphoreCache<Session> SessionCache = new();

    public async Task<TokenValidationResult?> ValidateTokenAsync(string token) {
        var handler = new JwtSecurityTokenHandler();
        var secretFile = await File.ReadAllTextAsync(config.PublicKeyPath);
        var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        key.ImportFromPem(secretFile);

        var res = await handler.ValidateTokenAsync(token, new TokenValidationParameters {
            IssuerSigningKey = new ECDsaSecurityKey(key),
            ValidAlgorithms = ["ES512"],
            LogValidationExceptions = true,
            // These are required to be false for the token to be valid as they aren't provided by the token
            ValidateIssuer = false,
            ValidateLifetime = false,
            ValidateAudience = false,
            // TryAllIssuerSigningKeys = true
        });

        if ((!res.IsValid || res.Exception is not null) && !config.DisableAuthentication) {
            logger.LogInformation("Invalid token");
            throw res.Exception ?? new UnauthorizedAccessException("Token was invalid");
        }

        return res;
    }

    public async Task<User> GetCurrentUserAsync(string token) {
        var res = await ValidateTokenAsync(token);
        return await UserCache.GetOrAdd(token,
            async () => {
                var uid = config.OverrideUid ?? res?.ClaimsIdentity.Claims.First(x => x.Type == "id").Value;
                if (string.IsNullOrWhiteSpace(uid)) throw new InvalidOperationException("No user ID specified, is the access token valid?");
                return await db.Users.FindAsync(uid) ?? throw new InvalidOperationException();
            },
            config.AuthCacheExpiry);
    }

    public async Task<Session> GetCurrentSessionAsync(string token) {
        var res = await ValidateTokenAsync(token);
        return await SessionCache.GetOrAdd(token,
            async () => {
                var did = config.OverrideDid ?? res?.ClaimsIdentity.Claims.First(x => x.Type == "did").Value;
                if (string.IsNullOrWhiteSpace(did)) throw new InvalidOperationException("No device ID specified, is the access token valid?");
                return await db.Sessions.FindAsync(did) ?? throw new InvalidOperationException();
            },
            config.AuthCacheExpiry);
    }
}