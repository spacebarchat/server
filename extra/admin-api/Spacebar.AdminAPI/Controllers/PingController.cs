using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminAPI.Services;

namespace Spacebar.AdminAPI.Controllers;

[ApiController]
[Route("/")]
public class PingController(ILogger<PingController> logger, IServiceProvider sp, AuthenticationService auth) : ControllerBase {
    private readonly ILogger<PingController> _logger = logger;

    [HttpGet("ping")]
    public async Task<object> Ping() {
        return new {
            ok = true
        };
    }
    
    [HttpGet("whoami")]
    public async Task<object> WhoAmI() {
        var user = await auth.GetCurrentUser(Request);
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