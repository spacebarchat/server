import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { CLOSECODES } from "./Constants";
import { DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT, setHeartbeat } from "./Heartbeat";
import type { WebSocket } from "./WebSocket";

afterEach(() => {
    mock.timers.reset();
});

function createSocket() {
    const closes: { code: number; reason?: string }[] = [];
    const socket = {
        close(code: number, reason?: string) {
            closes.push({ code, reason });
        },
    } as WebSocket;

    return { socket, closes };
}

describe("setHeartbeat", () => {
    it("uses the default gateway heartbeat timeout", () => {
        mock.timers.enable({ apis: ["setTimeout"] });
        const { socket, closes } = createSocket();

        setHeartbeat(socket);
        mock.timers.tick(DEFAULT_GATEWAY_HEARTBEAT_TIMEOUT - 1);
        assert.deepEqual(closes, []);

        mock.timers.tick(1);
        assert.deepEqual(closes, [{ code: CLOSECODES.Session_timed_out, reason: undefined }]);
    });

    it("closes the socket after the configured timeout", () => {
        mock.timers.enable({ apis: ["setTimeout"] });
        const { socket, closes } = createSocket();

        setHeartbeat(socket, 50);
        mock.timers.tick(49);
        assert.deepEqual(closes, []);

        mock.timers.tick(1);
        assert.deepEqual(closes, [{ code: CLOSECODES.Session_timed_out, reason: undefined }]);
    });

    it("clears the previous heartbeat timeout before scheduling a new one", () => {
        mock.timers.enable({ apis: ["setTimeout"] });
        const { socket, closes } = createSocket();

        setHeartbeat(socket, 50);
        setHeartbeat(socket, 400);
        mock.timers.tick(399);

        assert.deepEqual(closes, []);
        mock.timers.tick(1);
        assert.deepEqual(closes, [{ code: CLOSECODES.Session_timed_out, reason: undefined }]);
    });
});
