using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/Identify")]
public class IdentifyController(ILogger<IdentifyController> logger, SpacebarAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp) : ControllerBase
{
    
}