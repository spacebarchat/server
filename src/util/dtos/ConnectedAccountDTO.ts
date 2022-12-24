import { ConnectedAccount } from "../entities";

export class ConnectedAccountDTO {
	id: string;
	user_id: string;
	access_token?: string;
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

	constructor(
		connectedAccount: ConnectedAccount,
		with_token: boolean = false,
	) {
		this.id = connectedAccount.external_id;
		this.user_id = connectedAccount.user_id;
		this.access_token =
			connectedAccount.token_data && with_token
				? connectedAccount.token_data.access_token
				: undefined;
		this.friend_sync = connectedAccount.friend_sync;
		this.name = connectedAccount.name;
		this.revoked = connectedAccount.revoked;
		this.show_activity = connectedAccount.show_activity;
		this.type = connectedAccount.type;
		this.verified = connectedAccount.verified;
		this.visibility = +(connectedAccount.visibility || false);
		this.integrations = connectedAccount.integrations;
		this.metadata_ = connectedAccount.metadata_;
		this.metadata_visibility = +(
			connectedAccount.metadata_visibility || false
		);
		this.two_way_link = connectedAccount.two_way_link;
	}
}
