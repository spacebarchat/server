import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Webhook } from "../entities";
import { toAPIWebhook } from "./WebhookDTO";

describe("WebhookDTO", () => {
    const incomingWebhookType = 1;

    test("serializes only public API webhook fields", () => {
        const webhook = {
            id: "1000",
            type: incomingWebhookType,
            guild_id: "2000",
            channel_id: "3000",
            user_id: "4000",
            user: {
                id: "4000",
                username: "hook-owner",
                discriminator: "0001",
                avatar: null,
                public_flags: 1,
                email: "owner@example.invalid",
                phone: "555-0100",
                mfa_enabled: true,
            },
            name: "release-hook",
            avatar: null,
            token: "secret-token",
            application_id: "5000",
            source_guild_id: "6000",
            source_channel_id: "7000",
            guild: { id: "2000", name: "private guild relation" },
            channel: { id: "3000", name: "private channel relation" },
            application: { id: "5000", bot_public: false },
            source_guild: { id: "6000" },
            source_channel: { id: "7000" },
        } as unknown as Webhook;

        const apiWebhook = toAPIWebhook(webhook, {
            url: "https://example.invalid/webhooks/1000/secret-token",
        });

        assert.deepEqual(Object.keys(apiWebhook).sort(), [
            "application_id",
            "avatar",
            "channel_id",
            "guild_id",
            "id",
            "name",
            "source_channel_id",
            "source_guild_id",
            "token",
            "type",
            "url",
            "user",
        ]);
        assert.equal("user_id" in apiWebhook, false);
        assert.equal("guild" in apiWebhook, false);
        assert.equal("channel" in apiWebhook, false);
        assert.equal("application" in apiWebhook, false);
        assert.equal("source_guild" in apiWebhook, false);
        assert.equal("source_channel" in apiWebhook, false);

        assert.deepEqual(apiWebhook.user, {
            id: "4000",
            username: "hook-owner",
            discriminator: "0001",
            avatar: null,
            public_flags: 1,
        });
    });

    test("uses loaded relation ids without exposing the loaded relations", () => {
        const webhook = {
            id: "1000",
            type: incomingWebhookType,
            name: "release-hook",
            avatar: null,
            guild: { id: "2000" },
            channel: { id: "3000" },
            application: { id: "5000" },
            source_guild: { id: "6000" },
            source_channel: { id: "7000" },
        } as unknown as Webhook;

        const apiWebhook = toAPIWebhook(webhook);

        assert.equal(apiWebhook.guild_id, "2000");
        assert.equal(apiWebhook.channel_id, "3000");
        assert.equal(apiWebhook.application_id, "5000");
        assert.equal(apiWebhook.source_guild_id, "6000");
        assert.equal(apiWebhook.source_channel_id, "7000");
        assert.equal("guild" in apiWebhook, false);
        assert.equal("channel" in apiWebhook, false);
    });
});
