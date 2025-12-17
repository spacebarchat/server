/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

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

import crypto from "crypto";
import { ConnectedAccount } from "../entities";
import { ConnectedAccountSchema, ConnectionCallbackSchema } from "@spacebar/schemas";
import { Config, DiscordApiErrors } from "../util";

/**
 * A connection that can be used to connect to an external service.
 */
export abstract class Connection {
	id: string;
	settings: { enabled: boolean };
	states: Map<string, string> = new Map();

	abstract init(): void;

	/**
	 * Generates an authorization url for the connection.
	 * @param args
	 */
	abstract getAuthorizationUrl(userId: string): string;

	/**
	 * Returns the redirect_uri for a connection type
	 * @returns redirect_uri for this connection
	 */
	getRedirectUri() {
		return `${Config.get().general.frontPage}/connections/${this.id}/callback`;
	}

	/**
	 * Processes the callback
	 * @param args Callback arguments
	 */
	abstract handleCallback(params: ConnectionCallbackSchema): Promise<ConnectedAccount | null>;

	/**
	 * Gets a user id from state
	 * @param state the state to get the user id from
	 * @returns the user id associated with the state
	 */
	getUserId(state: string): string {
		if (!this.states.has(state)) throw DiscordApiErrors.INVALID_OAUTH_STATE;
		return this.states.get(state) as string;
	}

	/**
	 * Generates a state
	 * @param user_id The user id to generate a state for.
	 * @returns a new state
	 */
	createState(userId: string): string {
		const state = crypto.randomBytes(16).toString("hex");
		this.states.set(state, userId);

		return state;
	}

	/**
	 * Takes a state and checks if it is valid, and deletes it.
	 * @param state The state to check.
	 */
	validateState(state: string): void {
		if (!this.states.has(state)) throw DiscordApiErrors.INVALID_OAUTH_STATE;
		this.states.delete(state);
	}

	/**
	 * Creates a Connected Account in the database.
	 * @param data connected account data
	 * @returns the new connected account
	 */
	async createConnection(data: ConnectedAccountSchema): Promise<ConnectedAccount> {
		const ca = ConnectedAccount.create({ ...data });
		await ca.save();
		return ca;
	}

	/**
	 * Checks if a user has an exist connected account for the given extenal id.
	 * @param userId the user id
	 * @param externalId the connection id to find
	 * @returns
	 */
	async hasConnection(userId: string, externalId: string): Promise<boolean> {
		const existing = await ConnectedAccount.findOne({
			where: {
				user_id: userId,
				external_id: externalId,
			},
		});

		return !!existing;
	}
}
