import { HTTPError } from "lambert-server";
import { WebhookType } from "../../../schemas/api/channels/Webhook";

export enum ChannelFollowerChannelType {
    GuildText = 0,
    GuildVoice = 2,
    GuildNews = 5,
}

export type ChannelFollowerChannel = {
    id: string;
    guild_id?: string | null;
    name?: string | null;
    type: number;
};

export type ChannelFollowerWebhook = {
    type: WebhookType.ChannelFollower;
    name: string;
    guild_id: string;
    channel_id: string;
    user_id: string;
    source_guild_id: string;
    source_channel_id: string;
};

export function validateChannelFollowerChannels(source: ChannelFollowerChannel, target: ChannelFollowerChannel) {
    if (source.type !== ChannelFollowerChannelType.GuildNews || !source.guild_id) {
        throw new HTTPError("Cannot execute action on this channel type", 400);
    }

    if ((target.type !== ChannelFollowerChannelType.GuildText && target.type !== ChannelFollowerChannelType.GuildNews) || !target.guild_id) {
        throw new HTTPError("Cannot execute action on this channel type", 400);
    }
}

export function assertChannelFollowerWebhookLimit(existingWebhookCount: number, maxWebhooks?: number) {
    if (maxWebhooks && existingWebhookCount >= maxWebhooks) {
        throw new HTTPError(`Maximum number of webhooks reached (${maxWebhooks})`, 400);
    }
}

export function createChannelFollowerWebhookPayload(source: ChannelFollowerChannel, target: ChannelFollowerChannel, userId: string): ChannelFollowerWebhook {
    validateChannelFollowerChannels(source, target);

    return {
        type: WebhookType.ChannelFollower,
        name: source.name || "Channel Follower",
        guild_id: target.guild_id!,
        channel_id: target.id,
        user_id: userId,
        source_guild_id: source.guild_id!,
        source_channel_id: source.id,
    };
}

export function createFollowedChannelResponse(channelId: string, webhookId: string) {
    return {
        channel_id: channelId,
        webhook_id: webhookId,
    };
}
