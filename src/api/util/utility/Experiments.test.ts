import assert from "node:assert/strict";
import { describe, test } from "node:test";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

const { createApexExperimentsResponse, createExperimentsResponse } = require("./Experiments") as typeof import("./Experiments");

describe("experiment response helpers", () => {
    test("creates the legacy unauthenticated experiments body", () => {
        const response = createExperimentsResponse();

        assert.match(response.fingerprint, /^\d+\.[A-Za-z0-9+/=]+$/);
        assert.deepEqual(response.assignments, []);
        assert.deepEqual(response.guild_experiments, []);
    });

    test("creates the Apex experiments body with a stable installation id", () => {
        assert.deepEqual(createApexExperimentsResponse("installation-id"), {
            assignments: {},
            installation: "installation-id",
        });
    });

    test("generates an Apex installation id when none is supplied", () => {
        const response = createApexExperimentsResponse();

        assert.deepEqual(response.assignments, {});
        assert.match(response.installation, /^\d+\.[A-Za-z0-9+/=]+$/);
    });
});
