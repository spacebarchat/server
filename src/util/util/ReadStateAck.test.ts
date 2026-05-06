import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ReadStateFlags } from "../../schemas/uncategorised/MessageAcknowledgeSchema";
import { applyMessageAcknowledgeToReadState } from "./ReadStateAck";

describe("message ACK read-state updates", () => {
    test("persists modern ACK cursor fields used by READY read_state", () => {
        const readState = {
            last_message_id: "old-message",
            mention_count: 4,
            last_viewed: 1,
            flags: 0,
        };

        applyMessageAcknowledgeToReadState(readState, "message-1", {
            last_viewed: 3576,
            flags: ReadStateFlags.IS_GUILD_CHANNEL,
        });

        assert.deepEqual(readState, {
            last_message_id: "message-1",
            mention_count: 0,
            last_viewed: 3576,
            flags: ReadStateFlags.IS_GUILD_CHANNEL,
        });
    });

    test("preserves existing optional ACK cursor fields when the client omits them", () => {
        const readState = {
            last_viewed: 3576,
            flags: ReadStateFlags.IS_THREAD,
        };

        applyMessageAcknowledgeToReadState(readState, "message-1", {});

        assert.deepEqual(readState, {
            last_message_id: "message-1",
            mention_count: 0,
            last_viewed: 3576,
            flags: ReadStateFlags.IS_THREAD,
        });
    });

    test("defaults sparse read states to modern READY-compatible cursor values", () => {
        const readState = {};

        applyMessageAcknowledgeToReadState(readState, "message-1", {});

        assert.deepEqual(readState, {
            last_message_id: "message-1",
            mention_count: 0,
            last_viewed: 0,
            flags: 0,
        });
    });
});
