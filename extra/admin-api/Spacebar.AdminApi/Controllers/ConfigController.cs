using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminApi.Extensions;
using Spacebar.AdminApi.Models;
using Spacebar.AdminApi.Services;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;
using Spacebar.RabbitMqUtilities;
using Spacebar.ConfigModel.Extensions;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/Configuration")]
public class ConfigController(ILogger<ConfigController> logger, SpacebarDbContext db, RabbitMQService mq, IServiceProvider sp, AuthenticationService auth) : ControllerBase {
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
        // TODO: rabbitmq

        return Ok();
    }
    
    [HttpPost]
    public async Task<IActionResult> ReloadConfig() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        // TODO: rabbitmq

        return Ok();
    }
}