import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE, CROSSPOSTED_MESSAGE_FLAG, getCrosspostRejectionReason, markMessageCrossposted } from "./CrosspostMessage";

describe("crosspost message helpers", () => {
    test("marks messages as crossposted without clearing existing flags", () => {
        const existingFlags = 1 << 2;

        assert.equal(markMessageCrossposted(existingFlags), existingFlags | CROSSPOSTED_MESSAGE_FLAG);
    });

    test("rejects already crossposted messages", () => {
        const crossposted = CROSSPOSTED_MESSAGE_FLAG;

        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE, crossposted), "already_crossposted");
    });

    test("allows default messages in announcement channels", () => {
        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE, 0), undefined);
    });

    test("rejects non-announcement channels", () => {
        assert.equal(getCrosspostRejectionReason(0, CROSSPOSTABLE_MESSAGE_TYPE, 0), "channel_type");
    });

    test("rejects system messages", () => {
        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, 6, 0), "message_type");
    });
});
