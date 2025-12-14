using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using Spacebar.AdminApi.Services;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;

namespace Spacebar.AdminApi.Middleware;

public class AuthenticationMiddleware(RequestDelegate next) {
    private static Dictionary<string, User> _userCache = new();
    private static Dictionary<string, DateTime> _userCacheExpiry = new();

    public async Task InvokeAsync(HttpContext context, IServiceProvider sp) {
        var config = sp.GetRequiredService<Configuration>();
        if (context.Request.Path.StartsWithSegments("/ping") || config.DisableAuthentication) {
            await next(context);
            return;
        }

        if (!context.Request.Headers.ContainsKey("Authorization")) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Authorization header is missing");
            return;
        }

        var token = context.Request.Headers["Authorization"].ToString().Split(' ').Last();

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
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid token");
            return;
        }

        User user;
        if (_userCacheExpiry.ContainsKey(token) && _userCacheExpiry[token] < DateTime.Now) {
            _userCache.Remove(token);
            _userCacheExpiry.Remove(token);
        }

        if (!_userCache.ContainsKey(token)) {
            var db = sp.GetRequiredService<SpacebarDbContext>();
            user = await db.Users.FindAsync(config.OverrideUid ?? res.ClaimsIdentity.Claims.First(x => x.Type == "id").Value)
                   ?? throw new InvalidOperationException();
            _userCache[token] = user;
            _userCacheExpiry[token] = DateTime.Now.AddMinutes(5);
        }

        user = _userCache[token];
        if (user.Disabled) {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("User is disabled");
            return;
        }
        
        if (user.Deleted) {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("User is deleted");
            return;
        }
        
        await next(context);
    }
}