import {
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import wretch from "wretch";
import Connection from "../../util/connections/Connection";
import { FacebookSettings } from "./FacebookSettings";

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
		url.searchParams.append("redirect_uri", this.getRedirectUri());
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
		url.searchParams.append("redirect_uri", this.getRedirectUri());
		return url.toString();
	}

	async exchangeCode(
		state: string,
		code: string,
	): Promise<ConnectedAccountCommonOAuthTokenResponse> {
		this.validateState(state);

		const url = this.getTokenUrl(code);

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
			})
			.get()
			.json<ConnectedAccountCommonOAuthTokenResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async getUser(token: string): Promise<UserResponse> {
		const url = new URL(this.userInfoUrl);

		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
			})
			.get()
			.json<UserResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const userId = this.getUserId(params.state);
		const tokenData = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(tokenData.access_token);

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
