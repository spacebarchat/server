import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ajv } from "./Validator";

describe("WebhookExecuteSchema", () => {
    test("accepts null embeds and components", () => {
        const validate = ajv.getSchema("WebhookExecuteSchema");
        assert.ok(validate);

        const valid = validate({
            content: "bridged message",
            embeds: null,
            components: null,
        });

        assert.equal(valid, true, JSON.stringify(validate.errors, null, 2));
    });

    test("still rejects non-null embeds with the wrong type", () => {
        const validate = ajv.getSchema("WebhookExecuteSchema");
        assert.ok(validate);

        const valid = validate({
            content: "bridged message",
            embeds: {},
        });

        assert.equal(valid, false);
        assert.equal(validate.errors?.[0]?.instancePath, "/embeds");
    });

    test("still rejects non-null components with the wrong type", () => {
        const validate = ajv.getSchema("WebhookExecuteSchema");
        assert.ok(validate);

        const valid = validate({
            content: "bridged message",
            components: {},
        });

        assert.equal(valid, false);
        assert.equal(validate.errors?.[0]?.instancePath, "/components");
    });
});
