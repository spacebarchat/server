import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface EpicGamesConnectionUser {
	accountId: string;
	displayName: string;
	preferredLanguage: string;
}

export interface EpicGamesConnectionTokenResponse extends OAuthTokenResponse {
	expires_at: string;
	refresh_expires_in: number;
	refresh_expires_at: string;
	account_id: string;
	client_id: string;
	application_id: string;
}

export class EpicGamesConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "epicgames",
			authorizeUrl: "https://www.epicgames.com/id/authorize",
			tokenUrl: "https://api.epicgames.dev/epic/oauth/v1/token",
			userInfoUrl: "https://api.epicgames.dev/epic/id/v1/accounts",
			scopes: ["basic profile"]
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
				code: code
			})
		})
			.then((res) => res.json())
			.then((res: EpicGamesConnectionTokenResponse) => res.access_token)
			.catch((e) => {
				console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<EpicGamesConnectionUser> {
		const { sub } = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
		const url = new URL(this.options.userInfoUrl);
		url.searchParams.append("accountId", sub);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res) => res.json());
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: EpicGamesConnectionUser[]): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo[0].accountId,
			friend_sync: friend_sync,
			name: userInfo[0].displayName,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}

	async hasConnection(userId: string, userInfo: EpicGamesConnectionUser[]): Promise<boolean> {
		const existing = await ConnectedAccount.findOne({
			where: {
				user_id: userId,
				external_id: userInfo[0].accountId
			}
		});

		return !!existing;
	}
}
