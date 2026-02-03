using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Authentication.AspNetCore;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/")]
public class PingController(ILogger<PingController> logger, IServiceProvider sp, SpacebarAspNetAuthenticationService auth) : ControllerBase {
    private readonly ILogger<PingController> _logger = logger;

    [HttpGet("ping")]
    public async Task<object> Ping() {
        return new {
            ok = true
        };
    }
    
    [HttpGet("whoami")]
    public async Task<object> WhoAmI() {
        var user = await auth.GetCurrentUserAsync(Request);
        return new {
            user.Id,
            user.Username,
            user.Discriminator,
            user.Bot,
            user.Flags,
            user.Rights,
            user.MfaEnabled,
            user.WebauthnEnabled,
        };
    }
}