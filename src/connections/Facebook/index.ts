import {
	Config,
	ConnectedAccount,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import fetch from "node-fetch";
import Connection from "../../util/connections/Connection";
import { FacebookSettings } from "./FacebookSettings";

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

export interface FacebookErrorResponse {
	error: {
		message: string;
		type: string;
		code: number;
		fbtrace_id: string;
	};
}

interface UserResponse {
	name: string;
	id: string;
}

export default class FacebookConnection extends Connection {
	public readonly id = "facebook";
	public readonly authorizeUrl =
		"https://www.facebook.com/v14.0/dialog/oauth";
	public readonly tokenUrl =
		"https://graph.facebook.com/v14.0/oauth/access_token";
	public readonly userInfoUrl = "https://graph.facebook.com/v14.0/me";
	public readonly scopes = ["public_profile"];
	settings: FacebookSettings = new FacebookSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as FacebookSettings;
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
		url.searchParams.append("state", state);
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.scopes.join(" "));
		url.searchParams.append("display", "popup");
		return url.toString();
	}

	getTokenUrl(code: string): string {
		const url = new URL(this.tokenUrl);
		url.searchParams.append("client_id", this.settings.clientId!);
		url.searchParams.append("client_secret", this.settings.clientSecret!);
		url.searchParams.append("code", code);
		url.searchParams.append(
			"redirect_uri",
			`${
				Config.get().cdn.endpointPrivate || "http://localhost:3001"
			}/connections/${this.id}/callback`,
		);
		return url.toString();
	}

	async exchangeCode(state: string, code: string): Promise<string> {
		this.validateState(state);

		const url = this.getTokenUrl(code);

		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse & FacebookErrorResponse) => {
				if (res.error) throw new Error(res.error.message);
				return res.access_token;
			})
			.catch((e) => {
				console.error(
					`Error exchanging token for ${this.id} connection: ${e}`,
				);
				throw DiscordApiErrors.INVALID_OAUTH_TOKEN;
			});
	}

	async getUser(token: string): Promise<UserResponse> {
		const url = new URL(this.userInfoUrl);
		return fetch(url.toString(), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((res: UserResponse & FacebookErrorResponse) => {
				if (res.error) throw new Error(res.error.message);
				return res;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const userId = this.getUserId(params.state);
		const token = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(token);

		const exists = await this.hasConnection(userId, userInfo.id);

		if (exists) return null;

		return await this.createConnection({
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: params.friend_sync,
			name: userInfo.name,
			type: this.id,
		});
	}
}
