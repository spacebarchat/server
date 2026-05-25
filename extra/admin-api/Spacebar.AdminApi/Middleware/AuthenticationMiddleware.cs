using Microsoft.IdentityModel.Tokens;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Middleware;

public class AuthenticationMiddleware(
    ILogger<AuthenticationMiddleware> logger,
    SpacebarAspNetAuthenticationService authService,
    SpacebarAuthenticationConfiguration config,
    RequestDelegate next) {
    public async Task InvokeAsync(HttpContext context, IServiceProvider sp) {
        if (context.Request.Path.StartsWithSegments("/ping") || config.DisableAuthentication) {
            await next(context);
            return;
        }

        TokenValidationResult? res = null;
        try {
            await authService.ValidateTokenAsync(context.Request);
        }
        catch (Exception e) {
            logger.LogError("Failed to validate access token: {e}", e);
        }

        if (!(res?.IsValid ?? false)) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid token");
            return;
        }

        try {
            User user = await authService.GetCurrentUserAsync(context.Request);
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
        }
        catch (Exception e) {
            logger.LogError("Failed to query user: {e}", e);
            
            context.Response.StatusCode = 412;
            await context.Response.WriteAsync("Failed to find user");
            return;
        }

        await next(context);
    }
}