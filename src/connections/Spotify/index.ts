import {
	Config,
	ConnectedAccount,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import fetch from "node-fetch";
import Connection from "../../util/connections/Connection";
import { SpotifySettings } from "./SpotifySettings";

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

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

export default class SpotifyConnection extends Connection {
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

	async exchangeCode(state: string, code: string): Promise<string> {
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
			.then((res: OAuthTokenResponse & TokenErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res.access_token;
			})
			.catch((e) => {
				console.error(
					`Error exchanging token for ${this.id} connection: ${e}`,
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
		const token = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(token);

		const exists = await this.hasConnection(userId, userInfo.id);

		if (exists) return null;

		return await this.createConnection({
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: params.friend_sync,
			name: userInfo.display_name,
			type: this.id,
		});
	}
}
