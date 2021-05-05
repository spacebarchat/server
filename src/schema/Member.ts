export const MemberCreateSchema = {
	id: String,
    nick: String,
    guild_id: String,
	joined_at: Date,
};

export interface MemberCreateSchema {
	id: string;
    nick: string;
    guild_id: string;
	joined_at: Date;
}
