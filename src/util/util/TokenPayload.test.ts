import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { createTokenPayload, CurrentTokenFormatVersion, getTokenUserId } from "./TokenPayload";

describe("TokenPayload", () => {
    test("creates current tokens with the user id in the standard sub claim", () => {
        const payload = createTokenPayload("user-id", 123, "key-id", "device-id");

        assert.equal(payload.sub, "user-id");
        assert.equal(payload.id, undefined);
        assert.equal(payload.iat, 123);
        assert.equal(payload.kid, "key-id");
        assert.equal(payload.did, "device-id");
        assert.equal(payload.ver, CurrentTokenFormatVersion);
        assert.equal(CurrentTokenFormatVersion, 4);
    });

    test("reads the user id from sub for current tokens", () => {
        assert.equal(getTokenUserId({ sub: "new-user-id", iat: 123, ver: 4 }), "new-user-id");
    });

    test("still reads the user id from id for legacy tokens", () => {
        assert.equal(getTokenUserId({ id: "legacy-user-id", iat: 123, ver: 3 }), "legacy-user-id");
    });

    test("still reads the user id from id for legacy tokens without a version claim", () => {
        assert.equal(getTokenUserId({ id: "legacy-user-id", iat: 123 }), "legacy-user-id");
    });

    test("rejects current-version tokens that only use the legacy id claim", () => {
        assert.equal(getTokenUserId({ id: "legacy-user-id", iat: 123, ver: CurrentTokenFormatVersion }), undefined);
    });

    test("prefers sub when both claims are present", () => {
        assert.equal(getTokenUserId({ sub: "user-id", id: "user-id", iat: 123, ver: 4 }), "user-id");
    });

    test("rejects conflicting current and legacy user id claims", () => {
        assert.equal(getTokenUserId({ sub: "new-user-id", id: "legacy-user-id", iat: 123, ver: 4 }), undefined);
    });

    test("rejects tokens without a user id claim", () => {
        assert.equal(getTokenUserId({ iat: 123, ver: 4 }), undefined);
    });
});
