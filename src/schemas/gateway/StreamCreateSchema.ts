export interface StreamCreateSchema {
    type: "guild" | "call";
    channel_id: string;
    guild_id?: string;
    preferred_region?: string;
}

export const StreamCreateSchema = {
    type: String,
    channel_id: String,
    $guild_id: String,
    $preferred_region: String,
};
