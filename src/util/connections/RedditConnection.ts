import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface RedditConnectionUser {
	verified: boolean;
	coins: number;
	id: string;
	is_mod: boolean;
	has_verified_email: boolean;
	total_karma: number;
	name: string;
	created: number;
	gold_creddits: number;
	created_utc: number;
}

export interface RedditConnectionErrorResponse {
	message: string;
	error: number;
}
export class RedditConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "reddit",
			authorizeUrl: "https://www.reddit.com/api/v1/authorize",
			tokenUrl: "https://www.reddit.com/api/v1/access_token",
			userInfoUrl: "https://oauth.reddit.com/api/v1/me",
			scopes: ["identity"]
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
				Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: `${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`
			})
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & RedditConnectionErrorResponse) => {
				if (res.error) throw new Error(res.message);
				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<RedditConnectionUser> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res) => res.json());
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: RedditConnectionUser): ConnectedAccount {
		// TODO: metadata: gold, mod, total_karma, created_at
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: friend_sync,
			name: userInfo.name,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: userInfo.has_verified_email,
			visibility: 0,
			integrations: []
		});
	}

	async hasConnection(userId: string, userInfo: RedditConnectionUser): Promise<boolean> {
		const existing = await ConnectedAccount.findOne({
			where: {
				user_id: userId,
				external_id: userInfo.id
			}
		});

		return !!existing;
	}
}
