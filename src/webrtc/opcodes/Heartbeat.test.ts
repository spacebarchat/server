import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

afterEach(() => {
    mock.restoreAll();
});

describe("WebRTC onHeartbeat", () => {
    it("reschedules heartbeat timeouts with the configured gateway timeout", async () => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar";
        const { Config } = require("../../util/index.js") as typeof import("../../util/index.js");
        const HeartbeatUtil = require("../../gateway/util/Heartbeat.js") as typeof import("../../gateway/util/Heartbeat.js");
        const SendUtil = require("../util/Send.js") as typeof import("../util/Send.js");
        const heartbeatTimeout = 65_000;
        const socket = { encoding: "json", readyState: 1, send() {}, session_id: "session", user_id: "user" };
        const setHeartbeat = mock.method(HeartbeatUtil, "setHeartbeat", () => undefined);
        mock.method(SendUtil, "Send", async () => undefined);
        mock.method(Config, "get", () => ({ gateway: { heartbeatTimeout } }) as ReturnType<typeof Config.get>);
        const { onHeartbeat } = require("./Heartbeat.js") as typeof import("./Heartbeat.js");

        await onHeartbeat.call(socket as never, { op: 3, d: 1 });

        assert.equal(setHeartbeat.mock.callCount(), 1);
        assert.deepEqual(setHeartbeat.mock.calls[0].arguments, [socket, heartbeatTimeout]);
    });
});
