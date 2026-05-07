import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { OPCODES, type Payload } from "./Constants";
import { Send } from "./Send";
import type { WebSocket } from "./WebSocket";

type TestSocket = WebSocket & {
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

describe("gateway Send", () => {
    test("serializes circular JSON payloads before sending", async () => {
        type CircularDispatch = {
            created_at: Date;
            id: string;
            self?: CircularDispatch;
        };

        const dispatch: CircularDispatch = {
            created_at: new Date("2026-05-05T21:30:00.000Z"),
            id: "dispatch",
        };
        dispatch.self = dispatch;

        const payload: Payload = {
            op: OPCODES.Dispatch,
            d: dispatch,
            s: 1,
            t: "TEST_DISPATCH",
        };
        const socket = createJsonSocket();

        await Send(socket, payload);

        assert.equal(socket.sent, '{"op":0,"d":{"created_at":"2026-05-05T21:30:00.000+00:00","id":"dispatch"},"s":1,"t":"TEST_DISPATCH"}');
    });
});
