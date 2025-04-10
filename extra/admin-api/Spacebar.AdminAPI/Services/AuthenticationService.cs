using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using ArcaneLibs.Extensions;
using Microsoft.IdentityModel.Tokens;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;

namespace Spacebar.AdminAPI.Services;

public class AuthenticationService(SpacebarDbContext db, Configuration config) {
    private static Dictionary<string, User> _userCache = new();
    private static Dictionary<string, DateTime> _userCacheExpiry = new();
    
    public async Task<User> GetCurrentUser(HttpRequest request) {
        if (!request.Headers.ContainsKey("Authorization")) {
            throw new UnauthorizedAccessException();
        }

        var token = request.Headers["Authorization"].ToString().Split(' ').Last();

        var handler = new JwtSecurityTokenHandler();
        var secretFile = File.ReadAllText("../../../jwt.key.pub");
        var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        key.ImportFromPem(secretFile);

        var res = await handler.ValidateTokenAsync(token, new TokenValidationParameters {
            IssuerSigningKey = new ECDsaSecurityKey(key),
            ValidAlgorithms = new[] { "ES512" },
            LogValidationExceptions = true,
            // These are required to be false for the token to be valid as they aren't provided by the token
            ValidateIssuer = false,
            ValidateLifetime = false,
            ValidateAudience = false,
        });

        if (!res.IsValid) {
            throw new UnauthorizedAccessException();
        }

        return await db.Users.FindAsync(config.OverrideUid ?? res.ClaimsIdentity.Claims.First(x => x.Type == "id").Value) ?? throw new InvalidOperationException();
    }
}