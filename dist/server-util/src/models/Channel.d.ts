export interface Channel {
    id: bigint;
    guild_id: bigint;
    last_message_id: string;
    last_pin_timestamp: string;
    name: string;
    nsfw: boolean;
    parent_id: bigint;
    position: number;
    rate_limit_per_user: number;
    topic: string | null;
    type: number;
    permission_overwrites: {
        allow: bigint;
        deny: bigint;
        id: bigint;
        type: number;
    }[];
}
