import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { Send } from "./Send";
import { VoiceOPCodes, type VoicePayload } from "./Constants";
import type { WebRtcWebSocket } from "./WebRtcWebSocket";

type TestSocket = WebRtcWebSocket & {
    sent: Buffer | string | undefined;
};

function createJsonSocket(): TestSocket {
    const socket = {
        encoding: "json",
        readyState: 1,
        sent: undefined as Buffer | string | undefined,
        send(this: TestSocket, data: Buffer | string, callback: (err?: Error) => void) {
            this.sent = data;
            callback();
        },
        close() {
            throw new Error("socket should stay open during the send test");
        },
    };

    return socket as unknown as TestSocket;
}

describe("WebRTC Send", () => {
    test("serializes circular JSON payloads before sending", async () => {
        type CircularVoiceState = {
            heartbeat_at: Date;
            id: string;
            self?: CircularVoiceState;
        };

        const voiceState: CircularVoiceState = {
            heartbeat_at: new Date("2026-05-05T21:30:00.000Z"),
            id: "voice",
        };
        voiceState.self = voiceState;

        const payload: VoicePayload = {
            op: VoiceOPCodes.READY,
            d: voiceState,
        };
        const socket = createJsonSocket();

        await Send(socket, payload);

        assert.equal(socket.sent, '{"op":2,"d":{"heartbeat_at":"2026-05-05T21:30:00.000+00:00","id":"voice"}}');
    });
});
