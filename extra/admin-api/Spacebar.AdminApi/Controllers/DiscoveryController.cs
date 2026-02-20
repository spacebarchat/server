using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/discovery")]
public class DiscoveryController(
    ILogger<DiscoveryController> logger,
    SpacebarDbContext db,
    IServiceProvider sp,
    SpacebarAspNetAuthenticationService auth,
    ISpacebarReplication replication
) : ControllerBase {
    [HttpGet]
    public async Task GetDiscoverableGuilds() {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        // var discoverableGuilds = db.Guilds
            // .Where(x=>x.)
    }
}