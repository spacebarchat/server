import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ajv } from "../../../schemas/Validator";
import { normalizeEmbedPayload } from "./EmbedPayload";

describe("normalizeEmbedPayload", () => {
    test("removes empty embed footers", () => {
        const payload = {
            embeds: [
                {
                    title: "commit",
                    footer: {},
                },
            ],
        };

        normalizeEmbedPayload(payload);

        assert.deepEqual(payload, {
            embeds: [
                {
                    title: "commit",
                },
            ],
        });
    });

    test("removes footers that only contain nullish values", () => {
        const payload = {
            embeds: [
                {
                    footer: {
                        icon_url: null,
                        proxy_icon_url: undefined,
                    },
                },
            ],
        };

        normalizeEmbedPayload(payload);

        assert.deepEqual(payload, {
            embeds: [{}],
        });
    });

    test("leaves non-empty malformed footers for schema validation", () => {
        const payload = {
            embeds: [
                {
                    footer: {
                        icon_url: "https://example.com/icon.png",
                    },
                },
            ],
        };

        normalizeEmbedPayload(payload);

        assert.deepEqual(payload, {
            embeds: [
                {
                    footer: {
                        icon_url: "https://example.com/icon.png",
                    },
                },
            ],
        });
    });

    test("normalizes the legacy single embed field", () => {
        const payload = {
            embed: {
                footer: {},
            },
        };

        normalizeEmbedPayload(payload);

        assert.deepEqual(payload, {
            embed: {},
        });
    });

    for (const schemaName of ["MessageCreateSchema", "WebhookExecuteSchema"] as const) {
        test(`${schemaName} validates Codeberg-style empty embed footer after normalization`, () => {
            const validate = ajv.getSchema(schemaName);
            assert.ok(validate);

            const payload = {
                content: "commit pushed",
                embeds: [
                    {
                        title: "[repo:main] 1 new commit",
                        footer: {},
                    },
                ],
            };

            normalizeEmbedPayload(payload);

            assert.equal(validate(payload), true, JSON.stringify(validate.errors, null, 2));
        });
    }
});
