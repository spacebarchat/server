import { VoiceState } from "@spacebar/util";

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
        .then((e) => console.log("[Gateway] Successfully cleaned voice states"))
        .catch((e) => console.error("[Gateway] Error cleaning voice states on startup:", e));
}
