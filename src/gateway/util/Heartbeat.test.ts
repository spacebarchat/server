import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLOSECODES } from "./Constants";
import { DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT, setHeartbeat } from "./Heartbeat";
import type { WebSocket } from "./WebSocket";

function createSocket() {
    const closes: { code: number; reason?: string }[] = [];
    const socket = {
        close(code: number, reason?: string) {
            closes.push({ code, reason });
        },
    } as WebSocket;

    return { socket, closes };
}

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe("setHeartbeat", () => {
    it("uses the default gateway heartbeat timeout", () => {
        assert.equal(DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT, 45_000);
    });

    it("closes the socket after the configured timeout", async () => {
        const { socket, closes } = createSocket();

        setHeartbeat(socket, 5);
        await wait(15);

        assert.deepEqual(closes, [{ code: CLOSECODES.Session_timed_out, reason: undefined }]);
    });

    it("clears the previous heartbeat timeout before scheduling a new one", async () => {
        const { socket, closes } = createSocket();

        setHeartbeat(socket, 5);
        setHeartbeat(socket, 40);
        await wait(15);

        assert.deepEqual(closes, []);
        clearTimeout(socket.heartbeatTimeout);
    });
});
