import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface TwitchConnectionUserResponse {
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

export class TwitchConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "twitch",
			authorizeUrl: "https://id.twitch.tv/oauth2/authorize",
			tokenUrl: "https://id.twitch.tv/oauth2/token",
			userInfoUrl: "https://api.twitch.tv/helix/users",
			scopes: []
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
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.options.scopes.join(" "));
		url.searchParams.append("state", state);
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
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				redirect_uri: `${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`
			})
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse) => res.access_token)
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<TwitchConnectionUserResponse> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Client-Id": this.clientId
			}
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(`[${res.status}] ${res.error}: ${res.message}`);
				return res;
			});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: TwitchConnectionUserResponse, token: string): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.data[0].id,
			access_token: token,
			friend_sync: friend_sync,
			name: userInfo.data[0].display_name,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}
}
