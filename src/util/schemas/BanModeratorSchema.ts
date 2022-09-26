export interface BanModeratorSchema {
	id: string;
	user_id: string;
	guild_id: string;
	executor_id: string;
	reason?: string | undefined;
};