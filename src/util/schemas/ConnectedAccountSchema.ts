import { ConnectedAccountTokenData } from "../interfaces";

export interface ConnectedAccountSchema {
	external_id: string;
	user_id: string;
	token_data?: ConnectedAccountTokenData;
	friend_sync?: boolean;
	name: string;
	revoked?: boolean;
	show_activity?: number;
	type: string;
	verified?: boolean;
	visibility?: number;
	integrations?: string[];
	metadata_?: any;
	metadata_visibility?: number;
	two_way_link?: boolean;
}
