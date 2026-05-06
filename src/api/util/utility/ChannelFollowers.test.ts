import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { WebhookType } from "../../../schemas/api/channels/Webhook";
import {
    assertChannelFollowerWebhookLimit,
    ChannelFollowerChannelType,
    createChannelFollowerWebhookPayload,
    createFollowedChannelResponse,
    validateChannelFollowerChannels,
} from "./ChannelFollowers";

const source = {
    id: "source-channel",
    guild_id: "source-guild",
    name: "announcements",
    type: ChannelFollowerChannelType.GuildNews,
};

const target = {
    id: "target-channel",
    guild_id: "target-guild",
    type: ChannelFollowerChannelType.GuildText,
};

describe("ChannelFollowers", () => {
    test("accepts announcement source channels and guild text target channels", () => {
        assert.equal(validateChannelFollowerChannels(source, target), undefined);
    });

    test("rejects non-announcement source channels", () => {
        assert.throws(() => validateChannelFollowerChannels({ ...source, type: ChannelFollowerChannelType.GuildText }, target));
    });

    test("rejects non-guild target channels", () => {
        assert.throws(() => validateChannelFollowerChannels(source, { ...target, guild_id: null }));
    });

    test("rejects voice target channels", () => {
        assert.throws(() => validateChannelFollowerChannels(source, { ...target, type: ChannelFollowerChannelType.GuildVoice }));
    });

    test("enforces destination webhook limit", () => {
        assert.equal(assertChannelFollowerWebhookLimit(9, 10), undefined);
        assert.throws(() => assertChannelFollowerWebhookLimit(10, 10));
    });

    test("builds a channel follower webhook payload", () => {
        assert.deepEqual(createChannelFollowerWebhookPayload(source, target, "user-id"), {
            type: WebhookType.ChannelFollower,
            name: "announcements",
            guild_id: "target-guild",
            channel_id: "target-channel",
            user_id: "user-id",
            source_guild_id: "source-guild",
            source_channel_id: "source-channel",
        });
    });

    test("builds the followed channel response", () => {
        assert.deepEqual(createFollowedChannelResponse("target-channel", "webhook-id"), {
            channel_id: "target-channel",
            webhook_id: "webhook-id",
        });
    });
});
