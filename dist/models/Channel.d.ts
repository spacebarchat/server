export interface Channel {
    id: bigint;
    created_at: number;
    name: string;
    type: number;
    read_state: ReadState[];
}
export interface ReadState {
    last_message_id: bigint;
    last_pin_timestamp: number;
    mention_count: number;
}
export interface TextBasedChannel {
    messages: any[];
    last_message_id?: bigint;
    last_pin_timestamp?: number;
}
export interface GuildChannel extends Channel {
    guild_id: bigint;
    position: number;
    parent_id?: bigint;
    permission_overwrites: {
        allow: bigint;
        deny: bigint;
        id: bigint;
        type: number;
    }[];
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
