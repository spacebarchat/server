import { Config, ConnectedAccount, DiscordApiErrors, OrmUtils } from "@fosscord/util";
import fetch from "node-fetch";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface FacebookConnectionUser {
	name: string;
	id: string;
}

export interface FacebookErrorResponse {
	error: {
		message: string;
		type: string;
		code: number;
		fbtrace_id: string;
	};
}

export class FacebookConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "facebook",
			authorizeUrl: "https://www.facebook.com/v14.0/dialog/oauth",
			tokenUrl: "https://graph.facebook.com/v14.0/oauth/access_token",
			userInfoUrl: "https://graph.facebook.com/v14.0/me",
			scopes: ["public_profile"]
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
		url.searchParams.append("display", "popup");
		return url.toString();
	}

	makeTokenUrl(code: string): string {
		const url = new URL(this.options.tokenUrl);
		url.searchParams.append("client_id", this.clientId);
		url.searchParams.append("client_secret", this.clientSecret);
		url.searchParams.append("code", code);
		url.searchParams.append(
			"redirect_uri",
			`${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`
		);

		return url.toString();
	}

	async exchangeCode(code: string, state: string): Promise<string> {
		this.validateState(state);

		const url = this.makeTokenUrl(code);

		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Accept: "application/json"
			}
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & FacebookErrorResponse) => {
				if (res.error) throw new Error(res.error.message);
				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<FacebookConnectionUser> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then((res) => res.json())
			.then((res: FacebookConnectionUser & FacebookErrorResponse) => {
				if (res.error) throw new Error(res.error.message);
				return res;
			});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: FacebookConnectionUser): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: friend_sync,
			name: userInfo.name,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}
}
