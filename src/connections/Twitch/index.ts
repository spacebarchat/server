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
	ConnectionLoader,
	DiscordApiErrors,
	RefreshableConnection,
} from "@spacebar/util";
import wretch from "wretch";
import { TwitchSettings } from "./TwitchSettings";
import { ConnectionCallbackSchema } from "@spacebar/schemas"

interface TwitchConnectionUserResponse {
	data: {
		id: string;
		login: string;
		display_name: string;
		type: string;
		broadcaster_type: string;
		description: string;
		profile_image_url: string;
		offline_image_url: string;
		view_count: number;
		created_at: string;
	}[];
}

export default class TwitchConnection extends RefreshableConnection {
	public readonly id = "twitch";
	public readonly authorizeUrl = "https://id.twitch.tv/oauth2/authorize";
	public readonly tokenUrl = "https://id.twitch.tv/oauth2/token";
	public readonly userInfoUrl = "https://api.twitch.tv/helix/users";
	public readonly scopes = [
		"channel_subscriptions",
		"channel_check_subscription",
		"channel:read:subscriptions",
	];
	settings: TwitchSettings = new TwitchSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig<TwitchSettings>(
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

		url.searchParams.append("client_id", this.settings.clientId as string);
		url.searchParams.append("redirect_uri", this.getRedirectUri());
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.scopes.join(" "));
		url.searchParams.append("state", state);
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
					grant_type: "authorization_code",
					code: code,
					client_id: this.settings.clientId as string,
					client_secret: this.settings.clientSecret as string,
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

	async refreshToken(
		connectedAccount: ConnectedAccount,
	): Promise<ConnectedAccountCommonOAuthTokenResponse> {
		if (!connectedAccount.token_data?.refresh_token)
			throw new Error("No refresh token available.");
		const refresh_token = connectedAccount.token_data.refresh_token;

		const url = this.getTokenUrl();

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			})
			.body(
				new URLSearchParams({
					grant_type: "refresh_token",
					client_id: this.settings.clientId as string,
					client_secret: this.settings.clientSecret as string,
					refresh_token: refresh_token,
				}),
			)
			.post()
			.unauthorized(async () => {
				// assume the token was revoked
				await connectedAccount.revoke();
				return DiscordApiErrors.CONNECTION_REVOKED;
			})
			.json<ConnectedAccountCommonOAuthTokenResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async getUser(token: string): Promise<TwitchConnectionUserResponse> {
		const url = new URL(this.userInfoUrl);

		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
				"Client-Id": this.settings.clientId as string,
			})
			.get()
			.json<TwitchConnectionUserResponse>()
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

		const exists = await this.hasConnection(userId, userInfo.data[0].id);

		if (exists) return null;

		return await this.createConnection({
			token_data: { ...tokenData, fetched_at: Date.now() },
			user_id: userId,
			external_id: userInfo.data[0].id,
			friend_sync: params.friend_sync,
			name: userInfo.data[0].display_name,
			type: this.id,
		});
	}
}
