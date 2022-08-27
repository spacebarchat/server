import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface TwitterConnectionUserResponse {
	data: {
		id: string;
		name: string;
		username: string;
		created_at: string;
		location: string;
		url: string;
		description: string;
		verified: string;
	};
}

export interface TwitterConnectionErrorResponse {
	error: string;
	error_description: string;
}

export class TwitterConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "twitter",
			authorizeUrl: "https://twitter.com/i/oauth2/authorize",
			tokenUrl: "https://api.twitter.com/2/oauth2/token",
			userInfoUrl:
				"https://api.twitter.com/2/users/me?user.fields=created_at%2Cdescription%2Cid%2Cname%2Cusername%2Cverified%2Clocation%2Curl",
			scopes: ["users.read", "tweet.read"]
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
		url.searchParams.append("code_challenge", "challenge"); // TODO: properly use PKCE challenge
		url.searchParams.append("code_challenge_method", "plain");
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
				client_id: this.clientId,
				redirect_uri: `${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`,
				code_verifier: "challenge" // TODO: properly use PKCE challenge
			})
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & TwitterConnectionErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<TwitterConnectionUserResponse> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(`[${res.status}] ${res.error}: ${res.message}`);
				return res;
			});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: TwitterConnectionUserResponse, token: string): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.data.id,
			access_token: token,
			friend_sync: friend_sync,
			name: userInfo.data.username,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: userInfo.data.verified,
			visibility: 0,
			integrations: []
		});
	}
}
