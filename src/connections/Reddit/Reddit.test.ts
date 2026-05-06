import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { ConnectedAccountCommonOAuthTokenResponse, ConnectedAccountSchema } from "@spacebar/schemas";
import type { ConnectedAccount } from "@spacebar/util";
import type { UserResponse } from "./index";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/spacebar";

const RedditConnectionModule: typeof import("./index") = require("./index");
const RedditConnection = RedditConnectionModule.default;
const { getRedditConnectionMetadata } = RedditConnectionModule;

class TestRedditConnection extends RedditConnection {
    async exchangeCode(state: string): Promise<ConnectedAccountCommonOAuthTokenResponse> {
        this.validateState(state);

        return {
            access_token: "access-token",
            token_type: "bearer",
            scope: "identity",
        };
    }

    async getUser(): Promise<UserResponse> {
        return {
            verified: false,
            coins: 0,
            id: "reddit-id",
            is_mod: false,
            has_verified_email: false,
            name: "alien",
            created_utc: 1556828917,
        };
    }

    async hasConnection(): Promise<boolean> {
        return false;
    }

    async createConnection(data: ConnectedAccountSchema): Promise<ConnectedAccount> {
        return data as ConnectedAccount;
    }
}

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

    test("defaults missing optional Reddit counters instead of throwing", () => {
        const metadata = getRedditConnectionMetadata({
            verified: false,
            coins: 0,
            id: "reddit-id",
            is_mod: false,
            has_verified_email: false,
            name: "alien",
            created_utc: 1556828917,
        });

        assert.equal(metadata.gold, "0");
        assert.equal(metadata.total_karma, "0");
    });

    test("falls back to created when created_utc is missing", () => {
        const metadata = getRedditConnectionMetadata({
            verified: false,
            coins: 0,
            id: "reddit-id",
            is_mod: false,
            has_verified_email: false,
            total_karma: 0,
            name: "alien",
            gold_creddits: 0,
            created: 1556828917,
        });

        assert.equal(metadata.created_at, "2019-05-02T20:28:37");
    });

    test("handles reduced Reddit identity payloads through the callback path", async () => {
        const connection = new TestRedditConnection();
        const state = connection.createState("user-id");
        const account = await connection.handleCallback({
            state,
            code: "code",
            insecure: false,
            friend_sync: true,
        });

        assert.deepEqual(account?.metadata_, {
            gold: "0",
            mod: "0",
            total_karma: "0",
            created_at: "2019-05-02T20:28:37",
        });
        assert.equal(account?.user_id, "user-id");
        assert.equal(account?.external_id, "reddit-id");
    });
});
