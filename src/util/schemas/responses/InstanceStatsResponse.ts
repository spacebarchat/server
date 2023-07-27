export interface InstanceStatsResponse {
	counts: {
		user: number;
		guild: number;
		message: number;
		members: number;
	};
}
