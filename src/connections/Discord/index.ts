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

import {
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	Connection,
	ConnectionLoader,
	DiscordApiErrors,
} from "@spacebar/util";
import wretch from "wretch";
import { DiscordSettings } from "./DiscordSettings";
import { ConnectionCallbackSchema } from "@spacebar/schemas"

interface UserResponse {
	id: string;
	username: string;
	discriminator: string;
	avatar_url: string | null;
}

export default class DiscordConnection extends Connection {
	public readonly id = "discord";
	public readonly authorizeUrl = "https://discord.com/api/oauth2/authorize";
	public readonly tokenUrl = "https://discord.com/api/oauth2/token";
	public readonly userInfoUrl = "https://discord.com/api/users/@me";
	public readonly scopes = ["identify"];
	settings: DiscordSettings = new DiscordSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig<DiscordSettings>(
			this.id,
			this.settings,
		);

		if (
			this.settings.enabled &&
			(!this.settings.clientId || !this.settings.clientSecret)
		)
			throw new Error(`Invalid settings for connection ${this.id}`);
	}

	getAuthorizationUrl(userId: string): string {
		const state = this.createState(userId);
		const url = new URL(this.authorizeUrl);

		url.searchParams.append("state", state);
		url.searchParams.append("client_id", this.settings.clientId as string);
		url.searchParams.append("scope", this.scopes.join(" "));
		url.searchParams.append("response_type", "code");
		// controls whether, on repeated authorizations, the consent screen is shown
		url.searchParams.append("consent", "none");
		url.searchParams.append("redirect_uri", this.getRedirectUri());

		return url.toString();
	}

	getTokenUrl(): string {
		return this.tokenUrl;
	}

	async exchangeCode(
		state: string,
		code: string,
	): Promise<ConnectedAccountCommonOAuthTokenResponse> {
		this.validateState(state);
		const url = this.getTokenUrl();

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			})
			.body(
				new URLSearchParams({
					client_id: this.settings.clientId as string,
					client_secret: this.settings.clientSecret as string,
					grant_type: "authorization_code",
					code: code,
					redirect_uri: this.getRedirectUri(),
				}),
			)
			.post()
			.json<ConnectedAccountCommonOAuthTokenResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async getUser(token: string): Promise<UserResponse> {
		const url = new URL(this.userInfoUrl);
		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
			})
			.get()
			.json<UserResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const { state, code } = params;
		if (!code) throw new Error("No code provided");

		const userId = this.getUserId(state);
		const tokenData = await this.exchangeCode(state, code);
		const userInfo = await this.getUser(tokenData.access_token);

		const exists = await this.hasConnection(userId, userInfo.id);

		if (exists) return null;

		return await this.createConnection({
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: params.friend_sync,
			name: `${userInfo.username}#${userInfo.discriminator}`,
			type: this.id,
		});
	}
}
