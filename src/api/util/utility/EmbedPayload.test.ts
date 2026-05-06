import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import { ajv } from "../../../schemas/Validator";
import type { RouteOptions } from "../handlers/route";
import { normalizeEmbedPayload } from "./EmbedPayload";

type RequestBodySchema = NonNullable<RouteOptions["requestBody"]>;

async function validateWithRoute(schemaName: RequestBodySchema, body: unknown, stripNulls?: RouteOptions["stripNulls"]) {
    process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar";
    const { route } = await import("../handlers/route.js");
    const handler = route({
        requestBody: schemaName,
        stripNulls,
    });
    let nextCalled = false;
    const next: NextFunction = () => {
        nextCalled = true;
    };

    await handler({ body } as Request, {} as Response, next);

    assert.equal(nextCalled, true);
}

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

    test("removes footers that only contain nullish optional values", () => {
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

    test("preserves required and unknown nullish footer fields for schema validation", () => {
        const payload = {
            embeds: [
                {
                    footer: {
                        text: null,
                        icon_url: null,
                        unexpected: null,
                    },
                },
            ],
        };

        normalizeEmbedPayload(payload);

        assert.deepEqual(payload, {
            embeds: [
                {
                    footer: {
                        text: null,
                        unexpected: null,
                    },
                },
            ],
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

    test("normalizes nested embed payloads", () => {
        const payload = {
            data: {
                message: {
                    embeds: [
                        {
                            footer: {},
                        },
                    ],
                },
            },
        };

        normalizeEmbedPayload(payload);

        assert.deepEqual(payload, {
            data: {
                message: {
                    embeds: [{}],
                },
            },
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

describe("route embed payload normalization", () => {
    const routeCases: {
        schemaName: RequestBodySchema;
        body: unknown;
        expected: unknown;
        stripNulls?: RouteOptions["stripNulls"];
    }[] = [
        {
            schemaName: "MessageCreateSchema",
            stripNulls: {
                components: true,
                embeds: true,
            },
            body: {
                content: "message",
                embeds: [
                    {
                        title: "commit",
                        footer: {},
                    },
                ],
            },
            expected: {
                content: "message",
                embeds: [
                    {
                        title: "commit",
                    },
                ],
            },
        },
        {
            schemaName: "MessageEditSchema",
            body: {
                content: "updated",
                embeds: [
                    {
                        title: "commit",
                        footer: {},
                    },
                ],
            },
            expected: {
                content: "updated",
                embeds: [
                    {
                        title: "commit",
                    },
                ],
            },
        },
        {
            schemaName: "WebhookExecuteSchema",
            body: {
                content: "webhook",
                embeds: [
                    {
                        title: "commit",
                        footer: {},
                    },
                ],
            },
            expected: {
                content: "webhook",
                embeds: [
                    {
                        title: "commit",
                    },
                ],
            },
        },
        {
            schemaName: "ThreadCreationSchema",
            body: {
                name: "forum post",
                message: {
                    content: "starter",
                    embeds: [
                        {
                            title: "commit",
                            footer: {},
                        },
                    ],
                },
            },
            expected: {
                name: "forum post",
                message: {
                    content: "starter",
                    embeds: [
                        {
                            title: "commit",
                        },
                    ],
                },
            },
        },
        {
            schemaName: "InteractionCallbacksSchema",
            stripNulls: true,
            body: {
                type: 4,
                data: {
                    content: "response",
                    embeds: [
                        {
                            title: "commit",
                            footer: {},
                        },
                    ],
                },
            },
            expected: {
                type: 4,
                data: {
                    content: "response",
                    embeds: [
                        {
                            title: "commit",
                        },
                    ],
                },
            },
        },
    ];

    for (const routeCase of routeCases) {
        test(`${routeCase.schemaName} accepts empty footer objects before AJV validation`, async () => {
            const body = structuredClone(routeCase.body);

            await validateWithRoute(routeCase.schemaName, body, routeCase.stripNulls);

            assert.deepEqual(body, routeCase.expected);
        });
    }

    test("does not normalize a null footer text into an absent footer", async () => {
        const body = {
            content: "message",
            embeds: [
                {
                    footer: {
                        text: null,
                    },
                },
            ],
        };

        await assert.rejects(() =>
            validateWithRoute("MessageCreateSchema", body, {
                components: true,
                embeds: true,
            }),
        );
    });
});
