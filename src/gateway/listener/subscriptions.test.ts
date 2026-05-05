import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { unsubscribeEventIds } from "./subscriptions";

describe("unsubscribeEventIds", () => {
    test("cancels and removes each subscribed event id once", async () => {
        const cancelled: string[] = [];
        const events = {
            guild: async () => cancelled.push("guild"),
            channel: async () => cancelled.push("channel"),
        };

        await unsubscribeEventIds(events, ["guild", "channel", "channel", "missing"]);

        assert.deepEqual(cancelled.sort(), ["channel", "guild"]);
        assert.deepEqual(events, {});
    });

    test("removes subscriptions before awaiting cancellation", async () => {
        const events: Record<string, () => Promise<void>> = {};
        events.guild = async () => {
            assert.equal(events.guild, undefined);
        };

        await unsubscribeEventIds(events, ["guild"]);

        assert.deepEqual(events, {});
    });
});
