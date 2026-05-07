import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLOSECODES, OPCODES } from "../util/Constants";
import type { WebSocket } from "../util/WebSocket";
import { isValidHeartbeatPayload } from "./HeartbeatValidation";

describe("isValidHeartbeatPayload", () => {
    it("accepts normal heartbeat sequence payloads", () => {
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: null }), true);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: 123 }), true);
    });

    it("rejects malformed normal heartbeat payloads", () => {
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: undefined }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: "123" }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: 123n }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: Number.NaN }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: Number.POSITIVE_INFINITY }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: [] }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.Heartbeat, d: {} }), false);
    });

    it("accepts valid QoS heartbeat payloads", () => {
        assert.equal(
            isValidHeartbeatPayload({
                op: OPCODES.SetQoS,
                d: {
                    seq: null,
                    qos: {
                        ver: 1,
                        active: true,
                        reasons: ["foregrounded"],
                    },
                },
            }),
            true,
        );
        assert.equal(
            isValidHeartbeatPayload({
                op: OPCODES.SetQoS,
                d: {
                    qos: {
                        ver: 27,
                        active: true,
                        reasons: [],
                    },
                },
            }),
            true,
        );
        assert.equal(
            isValidHeartbeatPayload({
                op: OPCODES.SetQoS,
                d: {
                    seq: 456,
                    qos: {
                        ver: 27,
                        active: false,
                        reasons: ["backgrounded"],
                    },
                },
            }),
            true,
        );
    });

    it("rejects malformed QoS heartbeat payloads", () => {
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: null }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: { seq: "1", qos: { ver: 1, active: true, reasons: [] } } }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: { seq: Number.NaN, qos: { ver: 1, active: true, reasons: [] } } }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: { seq: 1, qos: { ver: "1", active: true, reasons: [] } } }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: { seq: 1, qos: { ver: Number.POSITIVE_INFINITY, active: true, reasons: [] } } }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: { seq: 1, qos: { ver: 1, active: "true", reasons: [] } } }), false);
        assert.equal(isValidHeartbeatPayload({ op: OPCODES.SetQoS, d: { seq: 1, qos: { ver: 1, active: true, reasons: [1] } } }), false);
    });

    it("closes malformed heartbeat payloads before refreshing heartbeat state", async () => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar_test";
        const { onHeartbeat } = await import("./Heartbeat.js");
        let closeCode: number | undefined;
        const propertyWrites: PropertyKey[] = [];
        const socket = new Proxy(
            {
                close(code: number) {
                    closeCode = code;
                },
            },
            {
                set(target, property, value, receiver) {
                    propertyWrites.push(property);
                    return Reflect.set(target, property, value, receiver);
                },
            },
        ) as unknown as WebSocket;

        await onHeartbeat.call(socket, { op: OPCODES.SetQoS, d: { seq: "1", qos: { ver: 1, active: true, reasons: [] } } });

        assert.equal(closeCode, CLOSECODES.Decode_error);
        assert.deepEqual(propertyWrites, []);
    });
});
