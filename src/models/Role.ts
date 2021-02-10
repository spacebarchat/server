export interface Role {
	id: bigint;
	color: number;
	hoist: boolean;
	managed: boolean;
	mentionable: boolean;
	name: string;
	permissions: bigint;
	position: number;
	tags?: {
		bot_id?: bigint;
	};
}
