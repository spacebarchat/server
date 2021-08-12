export const MemberCreateSchema = {
	id: String,
	nick: String,
	guild_id: String,
	joined_at: Date
};

export interface MemberCreateSchema {
	id: string;
	nick: string;
	guild_id: string;
	joined_at: Date;
}

export const MemberNickChangeSchema = {
	nick: String
};

export interface MemberNickChangeSchema {
	nick: string;
}

export const MemberChangeSchema = {
	$roles: [String]
};

export interface MemberChangeSchema {
	roles?: string[];
}
