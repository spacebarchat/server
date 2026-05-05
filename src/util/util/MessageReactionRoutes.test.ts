import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";

type OpenApiDocument = {
    paths: Record<string, Record<string, unknown>>;
};

describe("Message reaction route metadata", () => {
    test("declares @me reaction routes separately from moderation routes", () => {
        const openapi = JSON.parse(readFileSync("assets/openapi.json", "utf8")) as OpenApiDocument;
        const basePath = "/channels/{channel_id}/messages/{message_id}/reactions/{emoji}";

        assert.deepEqual(Object.keys(openapi.paths[`${basePath}/@me`]).sort(), ["delete", "put"]);
        assert.deepEqual(Object.keys(openapi.paths[`${basePath}/{user_id}`]), ["delete"]);
    });
});
