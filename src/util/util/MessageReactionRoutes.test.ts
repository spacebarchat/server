import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFileSync } from "node:fs";

type OpenApiDocument = {
    paths: Record<string, Record<string, { "x-permission-required"?: unknown }>>;
};

describe("Message reaction route metadata", () => {
    test("declares @me reaction routes separately from moderation routes", () => {
        const openapi = JSON.parse(readFileSync("assets/openapi.json", "utf8")) as OpenApiDocument;
        const basePath = "/channels/{channel_id}/messages/{message_id}/reactions/{emoji}";
        const selfReactionPath = openapi.paths[`${basePath}/@me`];
        const userReactionPath = openapi.paths[`${basePath}/{user_id}`];
        const burstUserReactionPath = openapi.paths[`${basePath}/{burst}/{user_id}`];

        assert.deepEqual(Object.keys(selfReactionPath).sort(), ["delete", "put"]);
        assert.deepEqual(Object.keys(userReactionPath), ["delete"]);
        assert.deepEqual(Object.keys(burstUserReactionPath), ["delete"]);
        assert.equal(selfReactionPath.delete["x-permission-required"], undefined);
        assert.equal(userReactionPath.delete["x-permission-required"], "MANAGE_MESSAGES");
        assert.equal(burstUserReactionPath.delete["x-permission-required"], "MANAGE_MESSAGES");
    });
});
