import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

describe("WebhookCreateResponse schema", () => {
    test("describes the webhook object returned by webhook routes", () => {
        const schemas = JSON.parse(readFileSync("assets/schemas.json", "utf8"));
        const properties = schemas.WebhookCreateResponse.properties;

        assert.ok(properties.id);
        assert.ok(properties.type);
        assert.ok(properties.user);
        assert.ok(!properties.hook);
    });
});
