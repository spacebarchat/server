using System.Diagnostics;
using ArcaneLibs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminApi.Extensions;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.AdminApi.Controllers.TestControllers;

[ApiController]
public class EmptyDmsController(
    ILogger<EmptyDmsController> logger,
    SpacebarAuthenticationConfiguration config,
    SpacebarDbContext db,
    IServiceProvider sp,
    SpacebarAspNetAuthenticationService auth,
    ISpacebarReplication replication
)  : ControllerBase {
    [HttpGet("emptydms")]
    public async IAsyncEnumerable<object> GetEmptyDms() {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        // TODO channel type enum
        var channels = db.Channels
            .Include(x=>x.Recipients)
            .Include(x=>x.Messages)
            .Where(x => x.Type == 1)
            .Where(x => !x.Messages.Any() && x.Recipients.Count == 1)
            ;
        
        await using var db2Scope = sp.CreateAsyncScope();
        await using var db3Scope = sp.CreateAsyncScope();
        var db2 = db2Scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        var db3 = db3Scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
        int count = 0;
        await foreach (var channel in channels.AsAsyncEnumerable()) {
            count++;
            yield return new {
                id = channel.Id,
                msgs = await db2.Messages.Where(x => x.ChannelId == channel.Id).CountAsync(),
                recips = await db3.Recipients.Where(x => x.ChannelId == channel.Id).CountAsync()
            };
        }
        
        logger.LogInformation("Got {count} empty DM channels", count);
        
        yield break;

    }
}