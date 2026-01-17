using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.AdminApi.Services;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;
using Spacebar.ConfigModel.Extensions;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/Configuration")]
public class ConfigController(ILogger<ConfigController> logger, SpacebarDbContext db, IServiceProvider sp, AuthenticationService auth, ISpacebarReplication replication)
    : ControllerBase {
    private readonly ILogger<ConfigController> _logger = logger;

    [HttpGet]
    public async Task<JsonObject> Get() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var config = (await db.Configs.AsNoTracking().ToDictionaryAsync(x => x.Key, x => x.Value)).ToNestedJsonObject();
        return config;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] JsonObject newConfig) {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var flatConfig = newConfig.ToFlatKv();
        var tasks = flatConfig.Select(async x => {
            await using var scope = sp.CreateAsyncScope();
            var scopedDb = scope.ServiceProvider.GetRequiredService<SpacebarDbContext>();
            var existingConfig = await scopedDb.Configs.FindAsync(x.Key);
            if (existingConfig != null) {
                existingConfig.Value = x.Value;
                scopedDb.Configs.Update(existingConfig);
            }
            else {
                await scopedDb.Configs.AddAsync(new Config
                    { Key = x.Key, Value = x.Value });
            }

            await scopedDb.SaveChangesAsync();
        });
        await Task.WhenAll(tasks);
        await replication.SendAsync(new() {
            Event = "SB_RELOAD_CONFIG",
            GuildId = "0",
            Origin = "Admin API (POST /Configuration)",
        });

        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> ReloadConfig() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        await replication.SendAsync(new() {
            Event = "SB_RELOAD_CONFIG",
            GuildId = "0",
            Origin = "Admin API (POST /Configuration/ReloadConfig)",
        });

        return Ok();
    }
}