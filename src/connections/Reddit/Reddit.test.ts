import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/spacebar";

const { getRedditConnectionMetadata }: typeof import("./index") = require("./index");

describe("RedditConnection metadata", () => {
    test("maps Reddit user data to Discord-compatible connection metadata", () => {
        const metadata = getRedditConnectionMetadata({
            verified: true,
            coins: 0,
            id: "reddit-id",
            is_mod: true,
            has_verified_email: true,
            total_karma: 20223,
            name: "alien",
            created: 1556828917,
            gold_creddits: 0,
            created_utc: 1556828917,
        });

        assert.deepEqual(metadata, {
            gold: "0",
            mod: "1",
            total_karma: "20223",
            created_at: "2019-05-02T20:28:37",
        });
    });

    test("serializes false moderator state as a string flag", () => {
        const metadata = getRedditConnectionMetadata({
            verified: false,
            coins: 0,
            id: "reddit-id",
            is_mod: false,
            has_verified_email: false,
            total_karma: 0,
            name: "alien",
            created: 1556828917,
            gold_creddits: 1,
            created_utc: 1556828917,
        });

        assert.equal(metadata.mod, "0");
        assert.equal(metadata.gold, "1");
    });
});
