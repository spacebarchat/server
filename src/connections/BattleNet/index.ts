import {
	Config,
	ConnectedAccount,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import fetch from "node-fetch";
import Connection from "../../util/connections/Connection";
import { BattleNetSettings } from "./BattleNetSettings";

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

interface BattleNetConnectionUser {
	sub: string;
	id: number;
	battletag: string;
}

interface BattleNetErrorResponse {
	error: string;
	error_description: string;
}

export default class BattleNetConnection extends Connection {
	public readonly id = "battlenet";
	public readonly authorizeUrl = "https://oauth.battle.net/authorize";
	public readonly tokenUrl = "https://oauth.battle.net/token";
	public readonly userInfoUrl = "https://us.battle.net/oauth/userinfo";
	public readonly scopes = [];
	settings: BattleNetSettings = new BattleNetSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as BattleNetSettings;
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
		url.searchParams.append("scope", this.scopes.join(" "));
		url.searchParams.append("state", state);
		url.searchParams.append("response_type", "code");
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
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				client_id: this.settings.clientId!,
				client_secret: this.settings.clientSecret!,
				redirect_uri: `${
					Config.get().cdn.endpointPrivate || "http://localhost:3001"
				}/connections/${this.id}/callback`,
			}),
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & BattleNetErrorResponse) => {
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

	async getUser(token: string): Promise<BattleNetConnectionUser> {
		const url = new URL(this.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((res: BattleNetConnectionUser & BattleNetErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const userId = this.getUserId(params.state);
		const token = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(token);

		const exists = await this.hasConnection(userId, userInfo.id.toString());

		if (exists) return null;

		return await this.createConnection({
			user_id: userId,
			external_id: userInfo.id.toString(),
			friend_sync: params.friend_sync,
			name: userInfo.battletag,
			type: this.id,
		});
	}
}
