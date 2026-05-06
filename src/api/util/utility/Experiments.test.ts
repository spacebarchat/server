import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

const { createApexExperimentsResponse, createExperimentsResponse } = require("./Experiments") as typeof import("./Experiments");
const { createClientFingerprint } = require("./Fingerprint") as typeof import("./Fingerprint");

describe("experiment response helpers", () => {
    test("creates the legacy unauthenticated experiments body", () => {
        const response = createExperimentsResponse();

        assert.match(response.fingerprint, /^\d+\.[A-Za-z0-9+/=]+$/);
        assert.deepEqual(response.assignments, []);
        assert.deepEqual(response.guild_experiments, []);
    });

    test("omits a new Apex installation id when a valid one is supplied", () => {
        const installation = createClientFingerprint();

        assert.deepEqual(createApexExperimentsResponse(installation), {
            assignments: {},
        });
    });

    test("generates an Apex installation id when none is supplied", () => {
        const response = createApexExperimentsResponse();

        assert.deepEqual(response.assignments, {});
        assert.match(response.installation!, /^\d+\.[A-Za-z0-9+/=]+$/);
    });

    test("replaces invalid Apex installation ids", () => {
        const response = createApexExperimentsResponse("not-a-valid-installation");

        assert.deepEqual(response.assignments, {});
        assert.notEqual(response.installation, "not-a-valid-installation");
        assert.match(response.installation!, /^\d+\.[A-Za-z0-9+/=]+$/);
    });
});
