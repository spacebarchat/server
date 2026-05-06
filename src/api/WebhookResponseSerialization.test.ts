import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

describe("webhook route response serialization", () => {
    const webhookResponseRoutes = [
        "src/api/routes/channels/#channel_id/webhooks.ts",
        "src/api/routes/guilds/#guild_id/webhooks.ts",
        "src/api/routes/webhooks/#webhook_id/index.ts",
        "src/api/routes/webhooks/#webhook_id/#token/index.ts",
    ];

    for (const routeFile of webhookResponseRoutes) {
        test(`${routeFile} serializes webhook responses through the API DTO`, () => {
            const source = readFileSync(routeFile, "utf8");

            assert.match(source, /\btoAPIWebhook\b/);
            assert.doesNotMatch(source, /\.\.\.webhook\b/);
            assert.doesNotMatch(source, /\.\.\.hook\b/);
            assert.doesNotMatch(source, /res\.json\(\s*webhook\s*\)/);
        });
    }

    test("token webhook update advertises and returns a webhook response", () => {
        const source = readFileSync("src/api/routes/webhooks/#webhook_id/#token/index.ts", "utf8");

        assert.doesNotMatch(source, /body: "Message"/);
        assert.match(source, /body: "WebhookCreateResponse"/);
        assert.match(source, /INVALID_WEBHOOK_TOKEN_PROVIDED/);
    });
});
