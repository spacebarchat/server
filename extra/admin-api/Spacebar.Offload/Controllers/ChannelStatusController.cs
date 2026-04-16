using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Gateway;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway")]
public class ChannelStatusController(ILogger<ChannelStatusController> logger, SpacebarAspNetAuthenticationService authService, SpacebarDbContext db, IServiceProvider sp)
    : ControllerBase {
    [HttpPost("ChannelStatuses")]
    public async IAsyncEnumerable<ReplicationMessage<ChannelStatusesResponse>> GetChannelStatuses([FromBody] ChannelStatusesRequest req) {
        await foreach (var res in GetChannelInfos(new() {
                           Fields = ["status"],
                           GuildIdRawValue = req.GuildIdRawValue,
                       })) {
            yield return new() {
                Payload = new() {
                    GuildId = res.Payload.GuildId,
                    Channels = res.Payload.Channels.Select(c => new ChannelStatus {
                        ChannelId = c.ChannelId,
                        Status = c.Status!,
                    }).ToList(),
                }
            };
        }
    }

    [HttpPost("ChannelInfo")]
    public async IAsyncEnumerable<ReplicationMessage<ChannelInfoResponse>> GetChannelInfos([FromBody] ChannelInfoRequest req) {
        var user = await authService.GetCurrentUserAsync(Request);
        string[] statusOptions = [
            "Vibing ✨",
            "Hanging out: 12%...",
            "Communicating...",
            // idk, i cant come up with more stuff, maybe suggestions welcome, or actually storing some data?
        ];

        foreach (var guildId in req.GuildIds ?? [req.GuildId!.Value]) {
            var channels = (await db.Channels.Include(x => x.VoiceStates).Where(x => x.Type == 2 && x.GuildId == guildId && x.VoiceStates.Count > 0)
                    .Select(x => x.Id)
                    .ToListAsync())
                .Select(x => new {
                    id = x,
                    status = statusOptions[new Random().Next(statusOptions.Length)], // TODO: We don't currently store channel statuses, so make some stuff up
                    voiceStartTime = DateTime.Now.Subtract(TimeSpan.FromMinutes(new Random().Next(1, 120))), // TODO: We also don't store voice start times, so make some stuff up
                }).ToList();

            yield return new() {
                Payload = new() {
                    GuildId = guildId,
                    Channels = channels.Select(c => new ChannelInfo {
                        ChannelId = c.id,
                        Status = req.Fields.Contains("status") ? c.status : null,
                        VoiceStartTime = req.Fields.Contains("voice_start_time") ? c.voiceStartTime : null,
                    }).ToList(),
                },
            };
        }
    }
}