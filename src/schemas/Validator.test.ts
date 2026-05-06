import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ajv } from "./Validator";

describe("WebhookExecuteSchema", () => {
    function getWebhookExecuteValidator() {
        const validate = ajv.getSchema("WebhookExecuteSchema");
        assert.ok(validate);
        return validate;
    }

    test("accepts null message-compatible optional fields", () => {
        const validate = getWebhookExecuteValidator();

        for (const field of ["embeds", "components", "allowed_mentions", "message_reference", "sticker_ids"]) {
            const valid = validate({
                content: "bridged message",
                [field]: null,
            });

            assert.equal(valid, true, `${field}: ${JSON.stringify(validate.errors, null, 2)}`);
        }
    });

    test("still rejects non-null embeds with the wrong type", () => {
        const validate = getWebhookExecuteValidator();

        const valid = validate({
            content: "bridged message",
            embeds: {},
        });

        assert.equal(valid, false);
        assert.equal(validate.errors?.[0]?.instancePath, "/embeds");
    });

    test("still rejects non-null components with the wrong type", () => {
        const validate = getWebhookExecuteValidator();

        const valid = validate({
            content: "bridged message",
            components: {},
        });

        assert.equal(valid, false);
        assert.equal(validate.errors?.[0]?.instancePath, "/components");
    });

    test("still rejects other nullable fields with the wrong non-null type", () => {
        const validate = getWebhookExecuteValidator();

        for (const [field, value] of [
            ["allowed_mentions", 1],
            ["message_reference", 1],
            ["sticker_ids", {}],
        ] as const) {
            const valid = validate({
                content: "bridged message",
                [field]: value,
            });

            assert.equal(valid, false, `${field} should reject ${JSON.stringify(value)}`);
            assert.equal(validate.errors?.[0]?.instancePath, `/${field}`);
        }
    });
});
