export interface Emoji {
	allNamesString: string; // e.g. :thonk:
	animated: boolean;
	available: boolean;
	guildId: bigint;
	id: bigint;
	managed: boolean;
	name: string;
	require_colons: boolean;
	url: string;
	roles: [];
}
