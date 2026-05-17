using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Gateway;

public class GatewayPayload {
    [JsonPropertyName("op")]
    public GatewayOpcode Opcode { get; set; }

    [JsonPropertyName("d")]
    public JsonObject? EventData { get; set; }

    [JsonPropertyName("s")]
    public int? Sequence { get; set; }

    [JsonPropertyName("t")]
    public string? DispatchEventType { get; set; }

    public T? GetData<T>() where T : class {
        if (EventData is null) return null;
        var sw = Stopwatch.StartNew();
        var jso = new JsonSerializerOptions();
        if (typeof(T) == typeof(ReadyResponse)) {
            Console.WriteLine("Adding ReadyResponse sourcegen");
            jso.TypeInfoResolver = new ReadyResponseSerializerContext();
        }
        else
            Console.WriteLine($"No TypeInfoResolver for {typeof(T).FullName}");

        var deserialized = EventData.Deserialize<T>(jso);
        Console.WriteLine($"Deserialized {typeof(T).FullName} in {sw.Elapsed}");
        return deserialized;
    }
}

public enum GatewayOpcode : byte {
    S2CDispatch,
    Heartbeat,
    C2SIdentify,
    C2SPresenceUpdate,
    C2SVoiceStateUpdate,
    C2SVoiceServerPing,
    C2SResume,
    S2CReconnect,
    C2SRequestGuildMembers,
    S2CInvalidSession,
    S2CHello,
    S2CHeartbeatAck,
    C2SGuildSync,
    C2SCallConnect,
    C2SGuildSubscriptions,
    C2SLobbyConnect,
    C2SLobbyDisconnect,
    C2SLobbyVoiceStates,
    C2SStreamCreate,
    C2SStreamDelete,
    C2SStreamWatch,
    C2SStreamPing,
    C2SStreamSetPaused,
    C2SLfgSubscription,
    C2SRequestGuildApplicationCommands,
    C2SEmbeddedActivityCreate,
    C2SEmbeddedActivityDelete,
    C2SEmbeddedActivityUpdate,
    C2SRequestForumUnreads,
    C2SRemoteCommand,
    C2SRequestDeletedEntityIds,
    C2SRequestSoundboardSounds,
    C2SSpeedTestCreate,
    C2SSpeedTestDelete,
    C2SRequestLastMessages,
    C2SSearchRecentMembers,
    C2SRequestChannelStatuses,
    C2SGuildSubscriptionsBulk,
    C2SGuildChannelsResync,
    C2SRequestChannelMemberCount,
    C2SQoSHeartbeat,
    C2SUpdateTimeSpentSessionId,
    C2SLobbyVoiceServerPing,
    C2SRequestChannelInfo
}