import { Guild } from "../../entities";

export interface DiscoverableGuildsResponse {
	total: number;
	guilds: Guild[];
	offset: number;
	limit: number;
}
