using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Middleware;

public class AuthenticationMiddleware(SpacebarAspNetAuthenticationService authService, SpacebarAuthenticationConfiguration config, RequestDelegate next) {
    public async Task InvokeAsync(HttpContext context, IServiceProvider sp) {
        if (context.Request.Path.StartsWithSegments("/ping") || config.DisableAuthentication) {
            await next(context);
            return;
        }

        var res = await authService.ValidateTokenAsync(context.Request);

        if (!(res?.IsValid ?? false)) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid token");
            return;
        }

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

        await next(context);
    }
}