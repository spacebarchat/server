import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { insertChannelInOrdering, normalizeChannelOrdering } from "./ChannelOrdering";

describe("Channel ordering helpers", () => {
    test("normalizes missing channel ordering to an empty array", () => {
        assert.deepEqual(normalizeChannelOrdering(undefined), []);
        assert.deepEqual(normalizeChannelOrdering(null), []);
    });

    test("inserts into missing channel ordering", () => {
        assert.deepEqual(insertChannelInOrdering(undefined, "channel_id", 0), {
            ordering: ["channel_id"],
            position: 0,
        });
    });

    test("moves existing channel instead of duplicating it", () => {
        assert.deepEqual(insertChannelInOrdering(["a", "b", "c"], "c", 1), {
            ordering: ["a", "c", "b"],
            position: 1,
        });
    });

    test("inserts after a parent channel id", () => {
        assert.deepEqual(insertChannelInOrdering(["parent", "sibling"], "child", "parent"), {
            ordering: ["parent", "child", "sibling"],
            position: 1,
        });
    });
});
