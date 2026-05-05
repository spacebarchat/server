import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

const { createClientFingerprint } = require("./Fingerprint") as typeof import("./Fingerprint");

describe("client fingerprint generation", () => {
    test("generates Discord-style snowflake fingerprints", () => {
        const fingerprint = createClientFingerprint();

        assert.match(fingerprint, /^\d+\.[A-Za-z0-9+/=]+$/);
    });
});
