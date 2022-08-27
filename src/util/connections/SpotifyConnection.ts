import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface SpotifyConnectionUser {
	display_name: string;
	id: string;
}

export interface SpotifyConnectionTokenErrorResponse {
	error: string;
	error_description: string;
}

export interface SpotifyConnectionErrorResponse {
	error: {
		status: number;
		message: string;
	};
}

export class SpotifyConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "spotify",
			authorizeUrl: "https://accounts.spotify.com/authorize",
			tokenUrl: "https://accounts.spotify.com/api/token",
			userInfoUrl: "https://api.spotify.com/v1/me",
			scopes: ["user-read-private", "user-read-playback-state", "user-modify-playback-state", "user-read-currently-playing"]
		});
	}

	makeAuthorizeUrl(userId: string): string {
		const state = this.createState(userId);
		const url = new URL(this.options.authorizeUrl);

		url.searchParams.append("client_id", this.clientId!);
		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append(
			"redirect_uri",
			`${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`
		);
		url.searchParams.append("state", state);
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.options.scopes.join(" "));
		return url.toString();
	}

	makeTokenUrl(): string {
		return this.options.tokenUrl;
	}

	async exchangeCode(code: string, state: string): Promise<string> {
		this.validateState(state);

		const url = this.makeTokenUrl();

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${this.clientId!}:${this.clientSecret!}`).toString("base64")}`
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: `${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`
			})
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & SpotifyConnectionTokenErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<SpotifyConnectionUser> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then((res) => res.json())
			.then((res: SpotifyConnectionUser & SpotifyConnectionErrorResponse) => {
				if (res.error) throw new Error(res.error.message);
				return res;
			});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: SpotifyConnectionUser, token: string): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: friend_sync,
			name: userInfo.display_name,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: [],
			access_token: token
		});
	}
}
