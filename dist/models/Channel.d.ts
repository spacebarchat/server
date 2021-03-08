/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface AnyChannel extends Channel, DMChannel, TextChannel, VoiceChannel {
}
export interface ChannelDocument extends Document, AnyChannel {
    id: bigint;
}
export declare const ChannelSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const ChannelModel: import("mongoose").Model<ChannelDocument>;
export interface Channel {
    id: bigint;
    created_at: Date;
    name: string;
    type: number;
}
export interface TextBasedChannel {
    last_message_id?: bigint;
    last_pin_timestamp?: number;
}
export interface GuildChannel extends Channel {
    guild_id: bigint;
    position: number;
    parent_id?: bigint;
    permission_overwrites: ChannelPermissionOverwrite[];
}
export interface ChannelPermissionOverwrite {
    allow: bigint;
    deny: bigint;
    id: bigint;
    type: ChannelPermissionOverwriteType;
}
export declare enum ChannelPermissionOverwriteType {
    role = 0,
    member = 1
}
export interface VoiceChannel extends GuildChannel {
}
export interface TextChannel extends GuildChannel, TextBasedChannel {
    nsfw: boolean;
    rate_limit_per_user: number;
    topic?: string;
}
export interface DMChannel extends Channel, TextBasedChannel {
    owner_id: bigint;
    recipients: bigint[];
}
export declare enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_NEWS = 5,
    GUILD_STORE = 6
}
