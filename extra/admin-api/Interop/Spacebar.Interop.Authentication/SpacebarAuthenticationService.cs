using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using ArcaneLibs.Collections;
using ArcaneLibs.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.Interop.Authentication;

public class SpacebarAuthenticationService(ILogger<SpacebarAuthenticationService> logger, SpacebarDbContext db, SpacebarAuthenticationConfiguration config) {
    private static readonly ExpiringSemaphoreCache<User> UserCache = new();
    private static readonly ExpiringSemaphoreCache<Session> SessionCache = new();

    private static bool _isInitialised;
    private static readonly JwtSecurityTokenHandler Handler = new();
    private static ECDsaSecurityKey _publicKey = null!, _privateKey = null!;

    private static readonly TokenValidationParameters TokenValidationParameters = new() {
        ValidAlgorithms = ["ES512"],
        LogValidationExceptions = true,
        // These are required to be false for the token to be valid as they aren't provided by the token
        ValidateIssuer = false,
        ValidateLifetime = false,
        ValidateAudience = false,
        // TryAllIssuerSigningKeys = true
    };

    public async Task InitializeAsync() {
        if (_isInitialised) return;

        var publicKeyFile = await File.ReadAllTextAsync(config.PublicKeyPath);
        var rawPublicKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        rawPublicKey.ImportFromPem(publicKeyFile);
        _publicKey = new ECDsaSecurityKey(rawPublicKey);

        var privateKeyFile = await File.ReadAllTextAsync(config.PrivateKeyPath);
        var rawPrivateKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        rawPrivateKey.ImportFromPem(privateKeyFile);
        _privateKey = new ECDsaSecurityKey(rawPrivateKey);

        TokenValidationParameters.IssuerSigningKey = _publicKey;
        _isInitialised = true;
    }

    public async Task<TokenValidationResult?> ValidateTokenAsync(string token) {
        if (!_isInitialised) await InitializeAsync();
        var res = await Handler.ValidateTokenAsync(token, TokenValidationParameters);

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
                return await db.Users.FindAsync(long.Parse(uid)) ?? throw new InvalidOperationException($"Could not find user with ID {uid}?");
            },
            config.AuthCacheExpiry);
    }

    public async Task<Session> GetCurrentSessionAsync(string token) {
        var res = await ValidateTokenAsync(token);
        return await SessionCache.GetOrAdd(token,
            async () => {
                var uid = config.OverrideUid ?? res?.ClaimsIdentity.Claims.First(x => x.Type == "id").Value;
                var did = config.OverrideDid ?? res?.ClaimsIdentity.Claims.First(x => x.Type == "did").Value;
                if (string.IsNullOrWhiteSpace(did)) throw new InvalidOperationException("No device ID specified, is the access token valid?");
                return await db.Sessions.SingleAsync(s => s.SessionId == did && s.UserId == long.Parse(uid))
                       ?? throw new InvalidOperationException($"Could not find device with ID {did}?");
            },
            config.AuthCacheExpiry);
    }

    public async Task<string> GenerateAccessTokenAsync(long userId, bool isAdminSession = false) {
        if (!_isInitialised) await InitializeAsync();
        // TODO: check for duplicate session IDs
        var sess = db.Sessions.Add(new() {
            UserId = userId,
            SessionId = Random.Shared.GetString("ABCDEFGHIJKLMNOPQRSTUVEXYZ", 10),
            IsAdminSession = isAdminSession,
            Status = "unknown",
            ClientStatus = "{}",
            ClientInfo = "{}"
        });
        await db.SaveChangesAsync();

        var res = Handler.CreateJwtSecurityToken(new() {
            Claims = new Dictionary<string, object>() {
                { "id", userId.ToString() },
                { "iat", new DateTimeOffset(sess.Entity.CreatedAt).ToUnixTimeSeconds() },
                { "kid", SHA256.Create().ComputeHash(_publicKey.ECDsa.ExportSubjectPublicKeyInfoPem().AsBytes().ToArray()) },
                { "ver", 3 },
                { "did", sess.Entity.SessionId },
            },
            SigningCredentials = new SigningCredentials(_privateKey, "ES512")
        });

        return Handler.WriteToken(res);
    }
}