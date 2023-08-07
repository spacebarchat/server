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
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
	RefreshableConnection,
} from "@spacebar/util";
import wretch from "wretch";
import { SpotifySettings } from "./SpotifySettings";

export interface UserResponse {
	display_name: string;
	id: string;
}

export interface TokenErrorResponse {
	error: string;
	error_description: string;
}

export interface ErrorResponse {
	error: {
		status: number;
		message: string;
	};
}

export default class SpotifyConnection extends RefreshableConnection {
	public readonly id = "spotify";
	public readonly authorizeUrl = "https://accounts.spotify.com/authorize";
	public readonly tokenUrl = "https://accounts.spotify.com/api/token";
	public readonly userInfoUrl = "https://api.spotify.com/v1/me";
	public readonly scopes = [
		"user-read-private",
		"user-read-playback-state",
		"user-modify-playback-state",
		"user-read-currently-playing",
	];
	settings: SpotifySettings = new SpotifySettings();

	init(): void {
		/**
		 * The way Discord shows the currently playing song is by using Spotifys partner API. This is obviously not possible for us.
		 * So to prevent spamming the spotify api we disable the ability to refresh.
		 */
		this.refreshEnabled = false;
		const settings = ConnectionLoader.getConnectionConfig<SpotifySettings>(
			this.id,
			this.settings,
		);

		if (settings.enabled && (!settings.clientId || !settings.clientSecret))
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
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId as string}:${
						this.settings.clientSecret as string
					}`,
				).toString("base64")}`,
			})
			.body(
				new URLSearchParams({
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
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId as string}:${
						this.settings.clientSecret as string
					}`,
				).toString("base64")}`,
			})
			.body(
				new URLSearchParams({
					grant_type: "refresh_token",
					refresh_token,
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
			token_data: { ...tokenData, fetched_at: Date.now() },
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: params.friend_sync,
			name: userInfo.display_name,
			type: this.id,
		});
	}
}
