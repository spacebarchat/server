/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
	metadata_?: unknown;
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
