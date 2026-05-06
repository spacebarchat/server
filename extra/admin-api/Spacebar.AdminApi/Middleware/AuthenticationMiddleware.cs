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
        var failure = AdminAuthenticationPolicy.GetFailure(user);
        if (failure is not null) {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync(AdminAuthenticationPolicy.GetFailureMessage(failure.Value));
            return;
        }

        await next(context);
    }
}
