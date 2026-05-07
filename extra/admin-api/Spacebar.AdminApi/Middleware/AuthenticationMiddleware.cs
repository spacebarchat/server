using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Models;
using Microsoft.IdentityModel.Tokens;

namespace Spacebar.AdminApi.Middleware;

public class AuthenticationMiddleware(ISpacebarAspNetAuthenticationService authService, SpacebarAuthenticationConfiguration config, RequestDelegate next) {
    public async Task InvokeAsync(HttpContext context, IServiceProvider sp) {
        if (context.Request.Path.StartsWithSegments("/ping") || config.DisableAuthentication) {
            await next(context);
            return;
        }

        TokenValidationResult? res;
        try {
            res = await authService.ValidateTokenAsync(context.Request);
        }
        catch (Exception ex) when (ex is UnauthorizedAccessException or SecurityTokenException or ArgumentException) {
            await WriteInvalidTokenResponse(context);
            return;
        }

        if (!(res?.IsValid ?? false)) {
            await WriteInvalidTokenResponse(context);
            return;
        }

        User user = await authService.GetCurrentUserAsync(context.Request);
        var failure = AdminAuthenticationPolicy.GetFailure(user);
        if (failure is not null) {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync(AdminAuthenticationPolicy.GetFailureMessage(failure.Value));
            return;
        }

        await next(context);
    }

    private static async Task WriteInvalidTokenResponse(HttpContext context) {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Invalid token");
    }
}
