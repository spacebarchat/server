using System.Diagnostics;
using ArcaneLibs;
using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.Extensions;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.AdminApi.Controllers.TestControllers;

[ApiController]
public class IpcTestController(
    ILogger<UserController> logger,
    SpacebarAuthenticationConfiguration config,
    SpacebarDbContext db,
    IServiceProvider sp,
    SpacebarAspNetAuthenticationService auth,
    ISpacebarReplication replication
)  : ControllerBase {
    [HttpGet("test")]
    public async IAsyncEnumerable<string> Test() {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var guildId = "1006649183970562092";
        // var roleId = "1006706520514028812"; //Administrator
        var roleId = "1391303296148639051"; //Spacebar Maintainer
        // int color = 16711680; //Administrator
        int color = 99839; //Spacebar Maintainer

        int framerate = 30;
        float delay = 1000f / framerate;
        var secondsPerRotation = 6.243f;
        // use delay, 255f = one rotation, lengthFactor = iterations to make a full rotation
        var lengthFactor = (secondsPerRotation * 1000f / delay);
        Console.WriteLine("Length factor: {0}, RPS: {1}", lengthFactor, 0);
        var re = new RainbowEnumerator(lengthFactor: lengthFactor, offset: color, skip: 1);
        var sw = Stopwatch.StartNew();
        while (true) {
            var clr = re.Next();
            color = clr.r << 16 | clr.g << 8 | clr.b;
            await replication.SendAsync(new() {
                Event = "GUILD_ROLE_UPDATE",
                GuildId = guildId,
                Origin = "Admin API (GET /users/test)",
                Payload = new {
                    guild_id = guildId,
                    role = new {
                        id = roleId,
                        guild_id = guildId,
                        color,
                        hoist = false,
                        managed = false,
                        mentionable = true,
                        name = "Spacebar Maintainer",
                        permissions = "8",
                        position = 5,
                        unicode_emoji = "",
                        flags = 0
                    }
                }
            });

            yield return $"{clr.r:X2} {clr.g:X2} {clr.b:X2} | {color:X8} | {sw.Elapsed} (waiting {Math.Max(0, (int)delay - (int)sw.ElapsedMilliseconds)} out of {delay} ms)";
            await Task.Delay(Math.Max(0, (int)delay - (int)sw.ElapsedMilliseconds));
            sw.Restart();
        }
    }
}