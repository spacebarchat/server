import {
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import wretch from "wretch";
import Connection from "../../util/connections/Connection";
import { DiscordSettings } from "./DiscordSettings";

interface UserResponse {
	id: string;
	username: string;
	discriminator: string;
	avatar_url: string | null;
}

export default class DiscordConnection extends Connection {
	public readonly id = "discord";
	public readonly authorizeUrl = "https://discord.com/api/oauth2/authorize";
	public readonly tokenUrl = "https://discord.com/api/oauth2/token";
	public readonly userInfoUrl = "https://discord.com/api/users/@me";
	public readonly scopes = ["identify"];
	settings: DiscordSettings = new DiscordSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as DiscordSettings;
	}

	getAuthorizationUrl(userId: string): string {
		const state = this.createState(userId);
		const url = new URL(this.authorizeUrl);

		url.searchParams.append("state", state);
		url.searchParams.append("client_id", this.settings.clientId!);
		url.searchParams.append("scope", this.scopes.join(" "));
		url.searchParams.append("response_type", "code");
		// controls whether, on repeated authorizations, the consent screen is shown
		url.searchParams.append("consent", "none");
		url.searchParams.append("redirect_uri", this.getRedirectUri());

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

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			})
			.body(
				new URLSearchParams({
					client_id: this.settings.clientId!,
					client_secret: this.settings.clientSecret!,
					grant_type: "authorization_code",
					code: code,
					redirect_uri: this.getRedirectUri(),
				}),
			)
			.post()
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
			name: `${userInfo.username}#${userInfo.discriminator}`,
			type: this.id,
		});
	}
}
