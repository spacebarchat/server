import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { excludeDmChannelRecipient } from "./DmChannelRecipients";

const recipients = [{ id: "creator" }, { id: "friend-a" }, { id: "friend-b" }];

describe("DM channel recipients", () => {
    test("omits the event recipient from group DM channel create payloads", () => {
        assert.deepEqual(
            excludeDmChannelRecipient(recipients, "creator").map((recipient) => recipient.id),
            ["friend-a", "friend-b"],
        );
    });

    test("keeps the creator visible to other group DM recipients", () => {
        assert.deepEqual(
            excludeDmChannelRecipient(recipients, "friend-a").map((recipient) => recipient.id),
            ["creator", "friend-b"],
        );
    });
});
