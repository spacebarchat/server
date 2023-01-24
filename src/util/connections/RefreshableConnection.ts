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
import { ConnectedAccountCommonOAuthTokenResponse } from "../interfaces";
import Connection from "./Connection";

/**
 * A connection that can refresh its token.
 */
export default abstract class RefreshableConnection extends Connection {
	refreshEnabled = true;
	/**
	 * Refreshes the token for a connected account.
	 * @param connectedAccount The connected account to refresh
	 */
	abstract refreshToken(
		connectedAccount: ConnectedAccount,
	): Promise<ConnectedAccountCommonOAuthTokenResponse>;

	/**
	 * Refreshes the token for a connected account and saves it to the database.
	 * @param connectedAccount The connected account to refresh
	 */
	async refresh(
		connectedAccount: ConnectedAccount,
	): Promise<ConnectedAccountCommonOAuthTokenResponse> {
		const tokenData = await this.refreshToken(connectedAccount);
		connectedAccount.token_data = { ...tokenData, fetched_at: Date.now() };
		await connectedAccount.save();
		return tokenData;
	}
}
