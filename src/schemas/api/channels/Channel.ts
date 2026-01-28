import { Channel, Recipient } from "@spacebar/util";
import { HTTPError } from "lambert-server";

export enum ChannelType {
    GUILD_TEXT = 0, // a text channel within a guild
    DM = 1, // a direct message between users
    GUILD_VOICE = 2, // a voice channel within a guild
    GROUP_DM = 3, // a direct message between multiple users
    GUILD_CATEGORY = 4, // an organizational category that contains zero or more channels
    GUILD_NEWS = 5, // a channel that users can follow and crosspost into a guild or route
    GUILD_STORE = 6, // a channel in which game developers can sell their things
    GUILD_LFG = 7, // @deprecated "A channel where users can match up for various games"
    LFG_GROUP_DM = 8, // @deprecated "A private channel between multiple users for a group within an LFG channel"
    THREAD_ALPHA = 9, // @deprecated "The first iteration of the threads feature, never widely used"
    GUILD_NEWS_THREAD = 10, // a temporary sub-channel within a GUILD_NEWS channel
    GUILD_PUBLIC_THREAD = 11, // a temporary sub-channel within a GUILD_TEXT channel
    GUILD_PRIVATE_THREAD = 12, // a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
    GUILD_STAGE_VOICE = 13, // a voice channel for hosting events with an audience
    GUILD_DIRECTORY = 14, // guild directory listing channel
    GUILD_FORUM = 15, // forum composed of IM threads
    GUILD_MEDIA = 16, // channel for media sharing
    LOBBY = 17, // a game lobby channel
    EPHEMERAL_DM = 18, // a private channel created by the social layer sdk
    UNHANDLED = 255, // unhandled unowned pass-through channel type
}

export interface ChannelPermissionOverwrite {
    allow: string;
    deny: string;
    id: string;
    type: ChannelPermissionOverwriteType;
}

export enum ChannelPermissionOverwriteType {
    role = 0,
    member = 1,
    group = 2,
}
export interface threadMetadata {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: string;
    locked: boolean;
    invitable?: boolean;
    create_timestamp: string; //Discord docs say this is optional, but it's only for after a certain date so it's not
}

export interface DMChannel extends Omit<Channel, "type" | "recipients"> {
    type: ChannelType.DM | ChannelType.GROUP_DM;
    recipients: Recipient[];
}

// TODO: probably more props
export function isTextChannel(type: ChannelType): boolean {
    switch (type) {
        case ChannelType.GUILD_STORE:
        case ChannelType.GUILD_STAGE_VOICE:
        case ChannelType.GUILD_CATEGORY:
        case ChannelType.GUILD_FORUM:
        case ChannelType.GUILD_DIRECTORY:
            throw new HTTPError("not a text channel", 400);
        case ChannelType.DM:
        case ChannelType.GROUP_DM:
        case ChannelType.GUILD_NEWS:
        case ChannelType.GUILD_VOICE:
        case ChannelType.GUILD_NEWS_THREAD:
        case ChannelType.GUILD_PUBLIC_THREAD:
        case ChannelType.GUILD_PRIVATE_THREAD:
        case ChannelType.GUILD_TEXT:
            return true;
        default:
            throw new HTTPError("unimplemented", 400);
    }
}
