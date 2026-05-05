import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

type OpenApiDocument = {
    paths: Record<string, Record<string, unknown>>;
};

describe("experiment route metadata", () => {
    test("declares both client experiment endpoints", () => {
        const openapi = JSON.parse(readFileSync("assets/openapi.json", "utf8")) as OpenApiDocument;

        assert.deepEqual(Object.keys(openapi.paths["/experiments/"]).sort(), ["get"]);
        assert.deepEqual(Object.keys(openapi.paths["/apex/experiments/"]).sort(), ["get"]);
    });
});
