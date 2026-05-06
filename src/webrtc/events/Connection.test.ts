import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { GATEWAY_HEARTBEAT_INTERVAL } from "../../util/config/types/GatewayConfiguration";

afterEach(() => {
    mock.restoreAll();
});

function createSocket() {
    const closes: { code: number; reason?: string }[] = [];
    const socket = {
        on() {
            return socket;
        },
        close(code: number, reason?: string) {
            closes.push({ code, reason });
            return socket;
        },
    };

    return { socket, closes };
}

describe("WebRTC Connection", () => {
    it("uses configured heartbeat timeout and advertises the shared heartbeat interval", async () => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar";
        const { Config } = require("../../util/index.js") as typeof import("../../util/index.js");
        const HeartbeatUtil = require("../../gateway/util/Heartbeat.js") as typeof import("../../gateway/util/Heartbeat.js");
        const SendUtil = require("../util/Send.js") as typeof import("../util/Send.js");
        const heartbeatTimeout = 65_000;
        const { socket } = createSocket();
        const sentPayloads: unknown[] = [];
        const setHeartbeat = mock.method(HeartbeatUtil, "setHeartbeat", () => undefined);
        mock.method(SendUtil, "Send", async (_socket: unknown, payload: unknown) => {
            sentPayloads.push(payload);
        });
        mock.method(Config, "get", () => ({ gateway: { heartbeatTimeout } }) as ReturnType<typeof Config.get>);
        const { Connection } = require("./Connection.js") as typeof import("./Connection.js");

        await Connection.call(
            { clients: { size: 1 } } as never,
            socket as never,
            {
                headers: {},
                socket: { remoteAddress: "127.0.0.1" },
                url: "/?v=5",
            } as never,
        );
        clearTimeout((socket as never as { readyTimeout?: NodeJS.Timeout }).readyTimeout);

        assert.equal(setHeartbeat.mock.callCount(), 1);
        assert.deepEqual(setHeartbeat.mock.calls[0].arguments, [socket, heartbeatTimeout]);
        assert.deepEqual(sentPayloads, [
            {
                op: 8,
                d: {
                    heartbeat_interval: GATEWAY_HEARTBEAT_INTERVAL,
                },
            },
        ]);
    });
});
