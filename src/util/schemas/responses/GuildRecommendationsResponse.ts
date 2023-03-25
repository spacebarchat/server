import { Guild } from "../../entities";

export interface GuildRecommendationsResponse {
	recommended_guilds: Guild[];
	load_id: string;
}
