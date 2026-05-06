import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

const { CLIENT_FINGERPRINT_PATTERN, createClientFingerprint, isClientFingerprint } = require("./Fingerprint") as typeof import("./Fingerprint");

describe("client fingerprint generation", () => {
    test("generates Discord-style snowflake fingerprints", () => {
        const fingerprint = createClientFingerprint();

        assert.match(fingerprint, CLIENT_FINGERPRINT_PATTERN);
        assert.equal(isClientFingerprint(fingerprint), true);
    });

    test("rejects malformed client fingerprints", () => {
        assert.equal(isClientFingerprint(undefined), false);
        assert.equal(isClientFingerprint("not-a-fingerprint"), false);
    });
});
