import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface BattleNetConnectionUser {
	sub: string;
	id: number;
	battletag: string;
}

export interface BattleNetErrorResponse {
	error: string;
	error_description: string;
}

export class BattleNetConnection extends BaseOAuthConnection {
	constructor() {
		// TODO: battlenet has multiple domains for different regions (US, EU, APAC, CN), do we NEED to use specific regions?
		super({
			id: "battlenet",
			authorizeUrl: "https://oauth.battle.net/authorize",
			tokenUrl: "https://oauth.battle.net/token",
			userInfoUrl: "https://us.battle.net/oauth/userinfo",
			scopes: []
		});
	}

	makeAuthorizeUrl(user_id: string): string {
		const state = this.createState(user_id);
		const url = new URL(this.options.authorizeUrl);

		url.searchParams.append("client_id", this.clientId!);
		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append(
			"redirect_uri",
			`${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${this.options.id}/callback`
		);
		url.searchParams.append("scope", this.options.scopes.join(" "));
		url.searchParams.append("state", state);
		url.searchParams.append("response_type", "code");
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
				Accept: "application/json"
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
			.then((res: OAuthTokenResponse & BattleNetErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res.access_token;
			})
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<BattleNetConnectionUser> {
		const url = new URL(this.options.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
			.then((res) => res.json())
			.then((res: BattleNetConnectionUser & BattleNetErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res;
			});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: BattleNetConnectionUser): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.battletag,
			friend_sync: friend_sync,
			name: userInfo.battletag,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}

	async hasConnection(userId: string, userInfo: BattleNetConnectionUser): Promise<boolean> {
		const existing = await ConnectedAccount.findOne({
			where: {
				user_id: userId,
				external_id: userInfo.battletag
			}
		});

		return !!existing;
	}
}
