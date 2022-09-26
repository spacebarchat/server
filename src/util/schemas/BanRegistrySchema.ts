export interface BanRegistrySchema {
	id: string;
	user_id: string;
	guild_id: string;
	executor_id: string;
	ip?: string;
	reason?: string | undefined;
}
