using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Gateway;
using Spacebar.Models.Generic;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/Identify")]
public class IdentifyController(ILogger<IdentifyController> logger, SpacebarAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp) : ControllerBase {
    [HttpPost("")]
    public async IAsyncEnumerable<ReplicationMessage> DoIdentify(IdentifyRequest payload) {
        var user = await TraceResult.TraceAsync("getAuthUser", () => authService.GetCurrentUserAsync(payload.Token));
        var session = await TraceResult.TraceAsync("getAuthSession", () => authService.GetCurrentSessionAsync(payload.Token));

        var socketMeta = new SbWebsocketMeta() {
            // Auth data
            AccessToken = payload.Token,
            UserId = user.Result.Id,
            SessionId = session.Result.SessionId,
            // Client capabilities
            Capabilities = payload.Capabilities ??= 0,
            LargeThreshold = payload.LargeTreshold ??= user.Result.Bot ? 20 : 250,
            Intents = payload.Intents ??= (GatewayIntentFlags)0b_110_11111111_11111111_11111111_11111111,
            // Sharding info
            ShardId = payload.Shard?[0],
            ShardCount = payload.Shard?[1],
        };

        if (socketMeta is { ShardId: not null, ShardCount: not null }) {
            if (socketMeta.ShardId < 0 || socketMeta.ShardCount <= 0 || socketMeta.ShardId >= socketMeta.ShardCount) {
                logger.LogWarning("Invalid sharding from {userId}: {shardId}/{shardCount}", user.Result.Id, socketMeta.ShardId, socketMeta.ShardCount);
                yield return this.Close(CloseCode.InvalidShard);
                yield break;
            }
        }

        yield return new() {
            Payload = new ReadyResponse { },
        };
    }

    private ReplicationMessage Close(CloseCode closeCode) => new() {
        Origin = "IdentifyController",
        Event = "SB_GW_CLOSE",
        Payload = new {
            code = closeCode,
        }
    };
}