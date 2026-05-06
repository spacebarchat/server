import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OPCODES } from "../util/Constants";
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
});
