import { ConnectedAccount, User, UserSettings } from "./User";
import { DMChannel, Channel } from "./Channel";
import { Guild } from "./Guild";
import { PublicMember, UserGuildSettings } from "./Member";
import { Emoji } from "./Emoji";
import { Presence } from "./Activity";
import { Role } from "./Role";
import { Invite } from "./Invite";
import { Message, PartialEmoji } from "./Message";
import { VoiceState } from "./VoiceState";
import { ApplicationCommand } from "./Application";
import { Interaction } from "./Interaction";
export interface Event {
    guild_id?: bigint;
    user_id?: bigint;
    channel_id?: bigint;
    created_at: number;
}
export interface Event {
    event: "READY";
    data: {
        v: number;
        user: Omit<User, "guilds" | "user_settings" | "valid_tokens_since" | "connected_accounts" | "relationships">;
        private_channels: DMChannel[];
        session_id: string;
        guilds: Guild[];
        analytics_token?: string;
        connected_accounts?: ConnectedAccount[];
        consents?: {
            personalization?: {
                consented?: boolean;
            };
        };
        country_code?: string;
        friend_suggestion_count?: number;
        geo_ordered_rtc_regions?: string[];
        experiments?: [number, number, number, number, number][];
        guild_experiments?: [
            number,
            null,
            number,
            [
                [number, {
                    e: number;
                    s: number;
                }[]]
            ],
            [
                number,
                [[number, [number, number]]]
            ],
            {
                b: number;
                k: bigint[];
            }[]
        ][];
        guild_join_requests?: [];
        shard?: [number, number];
        user_settings?: UserSettings;
        relationships?: [];
        user_guild_settings?: {
            entries: UserGuildSettings[];
            version: number;
            partial: boolean;
        };
        application?: {
            id: bigint;
            flags: bigint;
        };
        merged_members?: PublicMember[][];
        users?: {
            avatar?: string;
            discriminator: string;
            id: bigint;
            username: string;
            bot: boolean;
            public_flags: bigint;
        }[];
    };
}
export interface Event {
    event: "CHANNEL_CREATE";
    data: Channel;
}
export interface Event {
    event: "CHANNEL_UPDATE";
    data: Channel;
}
export interface Event {
    event: "CHANNEL_DELETE";
    data: Channel;
}
export interface Event {
    event: "CHANNEL_PINS_UPDATE";
    data: {
        guild_id?: bigint;
        channel_id: bigint;
        last_pin_timestamp: number;
    };
}
export interface Event {
    event: "GUILD_CREATE";
    data: Guild;
}
export interface Event {
    event: "GUILD_UPDATE";
    data: Guild;
}
export interface Event {
    event: "GUILD_DELETE";
    data: Guild;
}
export interface Event {
    event: "GUILD_BAN_ADD";
    data: {
        guild_id: bigint;
        user: User;
    };
}
export interface Event {
    event: "GUILD_BAN_REMOVE";
    data: {
        guild_id: bigint;
        user: User;
    };
}
export interface Event {
    event: "GUILD_EMOJI_UPDATE";
    data: {
        guild_id: bigint;
        emojis: Emoji[];
    };
}
export interface Event {
    event: "GUILD_INTEGRATIONS_UPDATE";
    data: {
        guild_id: bigint;
    };
}
export interface Event {
    event: "GUILD_MEMBER_ADD";
    data: PublicMember & {
        guild_id: bigint;
    };
}
export interface Event {
    event: "GUILD_MEMBER_REMOVE";
    data: {
        guild_id: bigint;
        user: User;
    };
}
export interface Event {
    event: "GUILD_MEMBER_UPDATE";
    data: {
        guild_id: bigint;
        roles: bigint[];
        user: User;
        nick?: string;
        joined_at: number;
        premium_since?: number;
        pending?: boolean;
    };
}
export interface Event {
    event: "GUILD_MEMBERS_CHUNK";
    data: {
        guild_id: bigint;
        members: PublicMember[];
        chunk_index: number;
        chunk_count: number;
        not_found: bigint[];
        presences: Presence[];
        nonce?: string;
    };
}
export interface Event {
    event: "GUILD_ROLE_CREATE";
    data: {
        guild_id: bigint;
        role: Role;
    };
}
export interface Event {
    event: "GUILD_ROLE_UPDATE";
    data: {
        guild_id: bigint;
        role: Role;
    };
}
export interface Event {
    event: "GUILD_ROLE_DELETE";
    data: {
        guild_id: bigint;
        role_id: bigint;
    };
}
export interface Event {
    event: "INVITE_CREATE";
    data: Omit<Invite, "guild", "channel"> & {
        channel_id: bigint;
        guild_id?: bigint;
    };
}
export interface Event {
    event: "INVITE_DELETE";
    data: {
        channel_id: bigint;
        guild_id?: bigint;
        code: string;
    };
}
export declare type MessagePayload = Omit<Message, "author_id"> & {
    channel_id: bigint;
    guild_id?: bigint;
    author: User;
    member: PublicMember;
    mentions: (User & {
        member: PublicMember;
    })[];
};
export interface Event {
    event: "MESSAGE_CREATE";
    data: MessagePayload;
}
export interface Event {
    event: "MESSAGE_UPDATE";
    data: MessagePayload;
}
export interface Event {
    event: "MESSAGE_DELETE";
    data: {
        id: bigint;
        channel_id: bigint;
        guild_id?: bigint;
    };
}
export interface Event {
    event: "MESSAGE_DELETE_BULK";
    data: {
        ids: bigint[];
        channel_id: bigint;
        guild_id?: bigint;
    };
}
export interface Event {
    event: "MESSAGE_REACTION_ADD";
    data: {
        user_id: bigint;
        channel_id: bigint;
        message_id: bigint;
        guild_id?: bigint;
        member?: PublicMember;
        emoji: PartialEmoji;
    };
}
export interface Event {
    event: "MESSAGE_REACTION_REMOVE";
    data: {
        user_id: bigint;
        channel_id: bigint;
        message_id: bigint;
        guild_id?: bigint;
        emoji: PartialEmoji;
    };
}
export interface Event {
    event: "MESSAGE_REACTION_REMOVE_ALL";
    data: {
        channel_id: bigint;
        message_id: bigint;
        guild_id?: bigint;
    };
}
export interface Event {
    event: "MESSAGE_REACTION_REMOVE_EMOJI";
    data: {
        channel_id: bigint;
        message_id: bigint;
        guild_id?: bigint;
        emoji: PartialEmoji;
    };
}
export interface Event {
    event: "PRESENCE_UPDATE";
    data: Presence;
}
export interface Event {
    event: "TYPING_START";
    data: {
        channel_id: bigint;
        user_id: bigint;
        timestamp: number;
        guild_id?: bigint;
        member?: PublicMember;
    };
}
export interface Event {
    event: "USER_UPDATE";
    data: User;
}
export interface Event {
    event: "VOICE_STATE_UPDATE";
    data: VoiceState & {
        member: PublicMember;
    };
}
export interface Event {
    event: "VOICE_SERVER_UPDATE";
    data: {
        token: string;
        guild_id: bigint;
        endpoint: string;
    };
}
export interface Event {
    event: "WEBHOOKS_UPDATE";
    data: {
        guild_id: bigint;
        channel_id: bigint;
    };
}
export declare type ApplicationCommandPayload = ApplicationCommand & {
    guild_id: bigint;
};
export interface Event {
    event: "APPLICATION_COMMAND_CREATE";
    data: ApplicationCommandPayload;
}
export interface Event {
    event: "APPLICATION_COMMAND_UPDATE";
    data: ApplicationCommandPayload;
}
export interface Event {
    event: "APPLICATION_COMMAND_DELETE";
    data: ApplicationCommandPayload;
}
export interface Event {
    event: "INTERACTION_CREATE";
    data: Interaction;
}
export declare type EVENT = "READY" | "CHANNEL_CREATE" | "CHANNEL_UPDATE" | "CHANNEL_DELETE" | "CHANNEL_PINS_UPDATE" | "GUILD_CREATE" | "GUILD_UPDATE" | "GUILD_DELETE" | "GUILD_BAN_ADD" | "GUILD_BAN_REMOVE" | "GUILD_EMOJI_UPDATE" | "GUILD_INTEGRATIONS_UPDATE" | "GUILD_MEMBER_ADD" | "GUILD_MEMBER_REMOVE" | "GUILD_MEMBER_UPDATE" | "GUILD_MEMBER_AVAILABLE" | "GUILD_MEMBER_SPEAKING" | "GUILD_MEMBERS_CHUNK" | "GUILD_ROLE_CREATE" | "GUILD_ROLE_DELETE" | "GUILD_ROLE_UPDATE" | "INVITE_CREATE" | "INVITE_DELETE" | "MESSAGE_CREATE" | "MESSAGE_DELETE" | "MESSAGE_UPDATE" | "MESSAGE_BULK_DELETE" | "MESSAGE_REACTION_ADD" | "MESSAGE_REACTION_REMOVE" | "MESSAGE_REACTION_REMOVE_ALL" | "PRESENCE_UPDATE" | "TYPING_START" | "USER_UPDATE" | "WEBHOOKS_UPDATE" | "INTERACTION_CREATE" | "VOICE_STATE_UPDATE" | "VOICE_SERVER_UPDATE" | "APPLICATION_COMMAND_CREATE" | "APPLICATION_COMMAND_UPDATE" | "APPLICATION_COMMAND_DELETE";
