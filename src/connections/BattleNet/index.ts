import {
	ApiError,
	Config,
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import fetch from "node-fetch";
import Connection from "../../util/connections/Connection";
import { BattleNetSettings } from "./BattleNetSettings";

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

	async exchangeCode(
		state: string,
		code: string,
	): Promise<ConnectedAccountCommonOAuthTokenResponse> {
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
			.then((res) => {
				if (!res.ok) {
					throw new ApiError("Failed to exchange code", 0, 400);
				}

				return res.json();
			})
			.then(
				(
					res: ConnectedAccountCommonOAuthTokenResponse &
						BattleNetErrorResponse,
				) => {
					if (res.error) throw new Error(res.error_description);
					return res;
				},
			)
			.catch((e) => {
				console.error(
					`Error exchanging token for ${this.id} connection: ${e}`,
				);
				throw DiscordApiErrors.GENERAL_ERROR;
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
			.then((res) => {
				if (!res.ok) {
					throw new ApiError("Failed to fetch user", 0, 400);
				}

				return res.json();
			})
			.then((res: BattleNetConnectionUser & BattleNetErrorResponse) => {
				if (res.error) throw new Error(res.error_description);
				return res;
			})
			.catch((e) => {
				console.error(
					`Error fetching user for ${this.id} connection: ${e}`,
				);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const userId = this.getUserId(params.state);
		const tokenData = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(tokenData.access_token);

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
