import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DmChannelDTO } from "./DmChannelDTO";
import { excludeDmChannelRecipient, excludeDmChannelRecipients } from "./DmChannelRecipients";

const recipients = [{ id: "creator" }, { id: "friend-a" }, { id: "friend-b" }] as DmChannelDTO["recipients"];

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

    test("omits multiple recipients with the shared helper", () => {
        assert.deepEqual(
            excludeDmChannelRecipients(recipients, ["creator", "friend-b"]).map((recipient) => recipient.id),
            ["friend-a"],
        );
    });

    test("DmChannelDTO.forRecipient returns a viewer-relative payload", () => {
        const channel_dto = Object.assign(new DmChannelDTO(), { recipients });

        assert.deepEqual(
            channel_dto.forRecipient("friend-b").recipients.map((recipient) => recipient.id),
            ["creator", "friend-a"],
        );
    });

    test("DmChannelDTO.excludedRecipients reuses the shared filtering semantics", () => {
        const channel_dto = Object.assign(new DmChannelDTO(), { recipients });

        assert.deepEqual(
            channel_dto.excludedRecipients(["creator", "friend-a"]).recipients.map((recipient) => recipient.id),
            ["friend-b"],
        );
    });
});
