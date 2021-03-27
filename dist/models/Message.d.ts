/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Types, Document } from "mongoose";
export interface Message {
    id: bigint;
    channel_id: bigint;
    guild_id?: bigint;
    author_id?: bigint;
    webhook_id?: bigint;
    application_id?: bigint;
    content?: string;
    timestamp: Date;
    edited_timestamp?: Date;
    tts?: boolean;
    mention_everyone?: boolean;
    mention_user_ids: bigint[];
    mention_role_ids: bigint[];
    mention_channels_ids: bigint[];
    attachments: Attachment[];
    embeds: Embed[];
    reactions: Reaction[];
    nonce?: string | number;
    pinned?: boolean;
    type: MessageType;
    activity?: {
        type: number;
        party_id: string;
    };
    flags?: bigint;
    stickers?: [];
    message_reference?: {
        message_id: bigint;
        channel_id?: bigint;
        guild_id?: bigint;
    };
}
export interface MessageDocument extends Document, Message {
    id: bigint;
}
export declare enum MessageType {
    DEFAULT = 0,
    RECIPIENT_ADD = 1,
    RECIPIENT_REMOVE = 2,
    CALL = 3,
    CHANNEL_NAME_CHANGE = 4,
    CHANNEL_ICON_CHANGE = 5,
    CHANNEL_PINNED_MESSAGE = 6,
    GUILD_MEMBER_JOIN = 7,
    USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
    CHANNEL_FOLLOW_ADD = 12,
    GUILD_DISCOVERY_DISQUALIFIED = 14,
    GUILD_DISCOVERY_REQUALIFIED = 15,
    REPLY = 19,
    APPLICATION_COMMAND = 20
}
export interface Attachment {
    id: bigint;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    height: number;
    width: number;
}
export interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: Date;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: EmbedImage;
    thumbnail?: EmbedImage;
    video?: EmbedImage;
    provider?: {
        name?: string;
        url?: string;
    };
    author?: {
        name?: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    fields?: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
}
export interface EmbedImage {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}
export interface Reaction {
    count: number;
    emoji: PartialEmoji;
}
export interface PartialEmoji {
    id?: bigint;
    name: string;
    animated?: boolean;
}
export interface AllowedMentions {
    parse?: ("users" | "roles" | "everyone")[];
    roles?: bigint[];
    users?: bigint[];
    replied_user?: boolean;
}
export declare const Attachment: {
    id: typeof Types.Long;
    filename: StringConstructor;
    size: NumberConstructor;
    url: StringConstructor;
    proxy_url: StringConstructor;
    height: NumberConstructor;
    width: NumberConstructor;
};
export declare const EmbedImage: {
    url: StringConstructor;
    proxy_url: StringConstructor;
    height: NumberConstructor;
    width: NumberConstructor;
};
export declare const Embed: {
    title: StringConstructor;
    type: StringConstructor;
    description: StringConstructor;
    url: StringConstructor;
    timestamp: DateConstructor;
    color: NumberConstructor;
    footer: {
        text: StringConstructor;
        icon_url: StringConstructor;
        proxy_icon_url: StringConstructor;
    };
    image: {
        url: StringConstructor;
        proxy_url: StringConstructor;
        height: NumberConstructor;
        width: NumberConstructor;
    };
    thumbnail: {
        url: StringConstructor;
        proxy_url: StringConstructor;
        height: NumberConstructor;
        width: NumberConstructor;
    };
    video: {
        url: StringConstructor;
        proxy_url: StringConstructor;
        height: NumberConstructor;
        width: NumberConstructor;
    };
    provider: {
        name: StringConstructor;
        url: StringConstructor;
    };
    author: {
        name: StringConstructor;
        url: StringConstructor;
        icon_url: StringConstructor;
        proxy_icon_url: StringConstructor;
    };
    fields: {
        name: StringConstructor;
        value: StringConstructor;
        inline: BooleanConstructor;
    }[];
};
export declare const MessageSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const MessageModel: import("mongoose").Model<MessageDocument>;
