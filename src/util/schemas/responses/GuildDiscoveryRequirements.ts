export interface GuildDiscoveryRequirementsResponse {
	uild_id: string;
	safe_environment: boolean;
	healthy: boolean;
	health_score_pending: boolean;
	size: boolean;
	nsfw_properties: unknown;
	protected: boolean;
	sufficient: boolean;
	sufficient_without_grace_period: boolean;
	valid_rules_channel: boolean;
	retention_healthy: boolean;
	engagement_healthy: boolean;
	age: boolean;
	minimum_age: number;
	health_score: {
		avg_nonnew_participators: number;
		avg_nonnew_communicators: number;
		num_intentful_joiners: number;
		perc_ret_w1_intentful: number;
	};
	minimum_size: number;
}
