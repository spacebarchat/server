import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE, CROSSPOSTED_MESSAGE_FLAG, getCrosspostRejectionReason, markMessageCrossposted } from "./crosspostHelpers";

describe("crosspost message helpers", () => {
    test("marks messages as crossposted without clearing existing flags", () => {
        const existingFlags = 1 << 2;

        assert.equal(markMessageCrossposted(existingFlags), existingFlags | CROSSPOSTED_MESSAGE_FLAG);
    });

    test("keeps crosspost flag updates idempotent", () => {
        const crossposted = CROSSPOSTED_MESSAGE_FLAG;

        assert.equal(markMessageCrossposted(crossposted), crossposted);
    });

    test("allows default messages in announcement channels", () => {
        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, CROSSPOSTABLE_MESSAGE_TYPE), undefined);
    });

    test("rejects non-announcement channels", () => {
        assert.equal(getCrosspostRejectionReason(0, CROSSPOSTABLE_MESSAGE_TYPE), "channel_type");
    });

    test("rejects system messages", () => {
        assert.equal(getCrosspostRejectionReason(CROSSPOSTABLE_CHANNEL_TYPE, 6), "message_type");
    });
});
