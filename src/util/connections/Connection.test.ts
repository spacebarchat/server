import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { ConnectionCallbackSchema } from "@spacebar/schemas";
import type { ConnectedAccount } from "../entities";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/spacebar";

const { Connection }: typeof import("@spacebar/util") = require("@spacebar/util");

class TestConnection extends Connection {
    id = "test";
    settings = { enabled: true };
    friendlyName = "Test";
    setupUrl = "https://example.com";
    requiredScopes: string[] = [];

    init(): void {
        // no-op for test connection
    }

    get isConfigured(): boolean {
        return true;
    }

    getAuthorizationUrl(userId: string): string {
        return `https://example.com/authorize?state=${this.createState(userId)}`;
    }

    async handleCallback(_params: ConnectionCallbackSchema): Promise<ConnectedAccount | null> {
        return null;
    }

    consumeStateForTest(state: string) {
        return this.consumeState(state);
    }
}

function assertInvalidOAuthState(fn: () => unknown): void {
    assert.throws(fn, {
        code: 50012,
        message: "Invalid OAuth2 state",
    });
}

describe("Connection OAuth state", () => {
    test("binds user ids and metadata to generated states", () => {
        const connection = new TestConnection();
        const metadata = { codeVerifier: "verifier" };
        const state = connection.createState("user-id", metadata);
        metadata.codeVerifier = "changed";

        assert.equal(connection.getUserId(state), "user-id");
        assert.equal(connection.states.get(state)?.data.codeVerifier, "verifier");
    });

    test("consumes state and metadata exactly once", () => {
        const connection = new TestConnection();
        const state = connection.createState("user-id", { codeVerifier: "verifier" });

        const consumed = connection.consumeStateForTest(state);

        assert.equal(consumed.userId, "user-id");
        assert.equal(consumed.data.codeVerifier, "verifier");
        assert.equal(connection.states.has(state), false);
        assertInvalidOAuthState(() => connection.consumeStateForTest(state));
    });

    test("validateState consumes the state", () => {
        const connection = new TestConnection();
        const state = connection.createState("user-id");

        connection.validateState(state);

        assert.equal(connection.states.has(state), false);
        assertInvalidOAuthState(() => connection.getUserId(state));
    });

    test("rejects expired states", () => {
        const connection = new TestConnection();
        connection.stateTTL = 10;
        const state = connection.createState("user-id");
        const oauthState = connection.states.get(state);
        assert(oauthState);
        oauthState.createdAt = Date.now() - connection.stateTTL - 1;

        assertInvalidOAuthState(() => connection.getUserId(state));
        assert.equal(connection.states.has(state), false);
    });

    test("prunes expired abandoned states when generating a new state", () => {
        const connection = new TestConnection();
        connection.stateTTL = 10;
        const abandonedState = connection.createState("old-user-id");
        const oauthState = connection.states.get(abandonedState);
        assert(oauthState);
        oauthState.createdAt = Date.now() - connection.stateTTL - 1;

        const freshState = connection.createState("new-user-id");

        assert.equal(connection.states.has(abandonedState), false);
        assert.equal(connection.getUserId(freshState), "new-user-id");
    });
});
