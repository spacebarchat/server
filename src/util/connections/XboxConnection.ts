import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { OAuthConnectionCallbackSchema } from "../schemas/ConnectionAuthCallbackSchema";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOAuthConnection, OAuthTokenResponse } from "./BaseOAuthConnection";

export interface XboxConnectionUserResponse {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xui: {
			gtg: string;
			xid: string;
			uhs: string;
			agg: string;
			usr: string;
			utr: string;
			prv: string;
		}[];
	};
}

export interface XboxConnectionErrorResponse {
	error: string;
	error_description: string;
}

export class XboxConnection extends BaseOAuthConnection {
	constructor() {
		super({
			id: "xbox",
			authorizeUrl: "https://login.live.com/oauth20_authorize.srf",
			tokenUrl: "https://login.live.com/oauth20_token.srf",
			userInfoUrl: "https://user.auth.xboxlive.com/user/authenticate",
			scopes: ["Xboxlive.signin", "Xboxlive.offline_access"]
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
		url.searchParams.append("approval_prompt", "auto");
		return url.toString();
	}

	makeTokenUrl(): string {
		return this.options.tokenUrl;
	}

	async exchangeCode({ state, code }: OAuthConnectionCallbackSchema): Promise<string> {
		this.validateState(state);

		const url = this.makeTokenUrl();

		return new Promise((resolve, reject) => {
			fetch(url.toString(), {
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
					scope: this.options.scopes.join(" ")
				})
			})
				.then((res) => res.json())
				.then((res: OAuthTokenResponse & XboxConnectionErrorResponse) => {
					if (res.error) reject(new Error(res.error_description));
					return res.access_token;
				})
				.then((token) => {
					this.getUserToken(token)
						.then((user_token) => {
							resolve(user_token);
						})
						.catch(reject);
				})
				.catch((e) => {
					console.error(`Error exchanging token for ${this.options.id} connection: ${e}`);
					reject(DiscordApiErrors.INVALID_OAUTH_TOKEN);
				});
		});
	}

	async getUserToken(token: string): Promise<string> {
		return fetch("https://user.auth.xboxlive.com/user/authenticate", {
			method: "POST",
			headers: { "x-xbl-contract-version": "3", "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify({
				RelyingParty: "http://auth.xboxlive.com",
				TokenType: "JWT",
				Properties: {
					AuthMethod: "RPS",
					SiteName: "user.auth.xboxlive.com",
					RpsTicket: `d=${token}`
				}
			})
		})
			.then((res) => res.json())
			.then((res) => res.Token)
			.catch((e) => {
				console.error(`Error getting user token for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(user_token: string): Promise<XboxConnectionUserResponse> {
		return fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
			method: "POST",
			headers: { "x-xbl-contract-version": "3", "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify({
				RelyingParty: "http://xboxlive.com",
				TokenType: "JWT",
				Properties: {
					UserTokens: [user_token],
					SandboxId: "RETAIL"
				}
			})
		})
			.then((res) => res.json())
			.catch((e) => {
				console.error(`Error getting user info (xsts token) for ${this.options.id} connection: ${e}`);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: XboxConnectionUserResponse, token: string): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.DisplayClaims.xui[0].xid,
			friend_sync: friend_sync,
			name: userInfo.DisplayClaims.xui[0].gtg,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}

	async hasConnection(userId: string, userInfo: XboxConnectionUserResponse): Promise<boolean> {
		const existing = await ConnectedAccount.findOne({
			where: {
				user_id: userId,
				external_id: userInfo.DisplayClaims.xui[0].xid
			}
		});

		return !!existing;
	}
}
