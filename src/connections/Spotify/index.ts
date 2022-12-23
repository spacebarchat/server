import {
	Config,
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import fetch from "node-fetch";
import RefreshableConnection from "../../util/connections/RefreshableConnection";
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
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as SpotifySettings;
	}

	getAuthorizationUrl(userId: string): string {
		const state = this.createState(userId);
		const url = new URL(this.authorizeUrl);

		url.searchParams.append("client_id", this.settings.clientId!);
		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append(
			"redirect_uri",
			`${
				Config.get().cdn.endpointPrivate || "http://localhost:3001"
			}/connections/${this.id}/callback`,
		);
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

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId!}:${this.settings.clientSecret!}`,
				).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: `${
					Config.get().cdn.endpointPrivate || "http://localhost:3001"
				}/connections/${this.id}/callback`,
			}),
		})
			.then((res) => res.json())
			.then(
				(
					res: ConnectedAccountCommonOAuthTokenResponse &
						TokenErrorResponse,
				) => {
					if (res.error) throw new Error(res.error_description);
					return res;
				},
			)
			.catch((e) => {
				console.error(
					`Error exchanging token for ${this.id} connection: ${e}`,
				);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async refreshToken(connectedAccount: ConnectedAccount) {
		if (!connectedAccount.token_data?.refresh_token)
			throw new Error("No refresh token available.");
		const refresh_token = connectedAccount.token_data.refresh_token;
		const url = this.getTokenUrl();

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId!}:${this.settings.clientSecret!}`,
				).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token,
			}),
		})
			.then((res) => res.json())
			.then(
				(
					res: ConnectedAccountCommonOAuthTokenResponse &
						TokenErrorResponse,
				) => {
					if (res.error) throw new Error(res.error_description);
					return res;
				},
			)
			.catch((e) => {
				console.error(
					`Error refreshing token for ${this.id} connection: ${e}`,
				);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<UserResponse> {
		const url = new URL(this.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((res: UserResponse & ErrorResponse) => {
				if (res.error) throw new Error(res.error.message);
				return res;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const userId = this.getUserId(params.state);
		const tokenData = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(tokenData.access_token);

		const exists = await this.hasConnection(userId, userInfo.id);

		if (exists) return null;

		return await this.createConnection({
			token_data: tokenData,
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: params.friend_sync,
			name: userInfo.display_name,
			type: this.id,
		});
	}
}
