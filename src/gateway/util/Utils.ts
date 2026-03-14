import { Event, VoiceState } from "@spacebar/util";
import { WebSocket } from "./WebSocket";
import { OPCODES } from "./Constants";
import { Send } from "./Send";

export function parseStreamKey(streamKey: string): {
    type: "guild" | "call";
    channelId: string;
    guildId?: string;
    userId: string;
} {
    const streamKeyArray = streamKey.split(":");

    const type = streamKeyArray.shift();

    if (type !== "guild" && type !== "call") {
        throw new Error(`Invalid stream key type: ${type}`);
    }

    if ((type === "guild" && streamKeyArray.length < 3) || (type === "call" && streamKeyArray.length < 2)) throw new Error(`Invalid stream key: ${streamKey}`); // invalid stream key

    let guildId: string | undefined;
    if (type === "guild") {
        guildId = streamKeyArray.shift();
    }
    const channelId = streamKeyArray.shift();
    const userId = streamKeyArray.shift();

    if (!channelId || !userId) {
        throw new Error(`Invalid stream key: ${streamKey}`);
    }
    return { type, channelId, guildId, userId };
}

export function generateStreamKey(type: "guild" | "call", guildId: string | undefined, channelId: string, userId: string): string {
    const streamKey = `${type}${type === "guild" ? `:${guildId}` : ""}:${channelId}:${userId}`;

    return streamKey;
}

// Temporary cleanup function until shutdown cleanup function is fixed.
// Currently when server is shut down the voice states are not cleared
// TODO: remove this when Server.stop() is fixed so that it waits for all websocket connections to run their
// respective Close event listener function for session cleanup
export async function cleanupOnStartup(): Promise<void> {
    // TODO: how is this different from clearing the table?
    //await VoiceState.update(
    //	{},
    //	{
    //		// @ts-expect-error channel_id is nullable
    //		channel_id: null,
    //		// @ts-expect-error guild_id is nullable
    //		guild_id: null,
    //		self_stream: false,
    //		self_video: false,
    //	},
    //);

    console.log("[Gateway] Starting async voice state wipe...");
    VoiceState.clear()
        .then(() => console.log("[Gateway] Successfully cleaned voice states"))
        .catch((e) => console.error("[Gateway] Error cleaning voice states on startup:", e));
}

export async function handleOffloadedGatewayRequest(socket: WebSocket, url: string, body: unknown) {
    // TODO: async json object streaming
    const resp = await fetch(url, {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
            Authorization: `Bearer ${socket.accessToken}`,
            // because the session may not have an id in the token!
            "X-Session-Id": socket.session_id,
        },
    });

    if (!resp.ok) {
        const text = await resp.text();
        console.error(`[Gateway] Offloaded request to ${url} failed with status ${resp.status}: ${text}`);
        if (resp.status === 415) console.log(typeof body, body);
        throw new Error(`Offloaded request failed with status ${resp.status}: ${text}`);
    }

    const data = ((await resp.json()) as Event[]).toReversed();
    while (data.length > 0) {
        const event = data.pop()!;
        if (process.env.WS_VERBOSE) console.log(`[Gateway] Received offloaded event: ${JSON.stringify(event)}`);
        await Send(socket, {
            op: OPCODES.Dispatch,
            s: socket.sequence++,
            t: event.event,
            d: event.data,
        });
    }
}
