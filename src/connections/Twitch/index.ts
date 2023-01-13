import {
	Config,
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import wretch from "wretch";
import RefreshableConnection from "../../util/connections/RefreshableConnection";
import { TwitchSettings } from "./TwitchSettings";

interface TwitchConnectionUserResponse {
	data: {
		id: string;
		login: string;
		display_name: string;
		type: string;
		broadcaster_type: string;
		description: string;
		profile_image_url: string;
		offline_image_url: string;
		view_count: number;
		created_at: string;
	}[];
}

export default class TwitchConnection extends RefreshableConnection {
	public readonly id = "twitch";
	public readonly authorizeUrl = "https://id.twitch.tv/oauth2/authorize";
	public readonly tokenUrl = "https://id.twitch.tv/oauth2/token";
	public readonly userInfoUrl = "https://api.twitch.tv/helix/users";
	public readonly scopes = [
		"channel_subscriptions",
		"channel_check_subscription",
		"channel:read:subscriptions",
	];
	settings: TwitchSettings = new TwitchSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as TwitchSettings;
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
		url.searchParams.append("response_type", "code");
		url.searchParams.append("scope", this.scopes.join(" "));
		url.searchParams.append("state", state);
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
					grant_type: "authorization_code",
					code: code,
					client_id: this.settings.clientId!,
					client_secret: this.settings.clientSecret!,
					redirect_uri: `${
						Config.get().cdn.endpointPrivate ||
						"http://localhost:3001"
					}/connections/${this.id}/callback`,
				}),
			)
			.post()
			.json<ConnectedAccountCommonOAuthTokenResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async refreshToken(
		connectedAccount: ConnectedAccount,
	): Promise<ConnectedAccountCommonOAuthTokenResponse> {
		if (!connectedAccount.token_data?.refresh_token)
			throw new Error("No refresh token available.");
		const refresh_token = connectedAccount.token_data.refresh_token;

		const url = this.getTokenUrl();

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			})
			.body(
				new URLSearchParams({
					grant_type: "refresh_token",
					client_id: this.settings.clientId!,
					client_secret: this.settings.clientSecret!,
					refresh_token: refresh_token,
				}),
			)
			.post()
			.unauthorized(async () => {
				// assume the token was revoked
				await connectedAccount.revoke();
				return DiscordApiErrors.CONNECTION_REVOKED;
			})
			.json<ConnectedAccountCommonOAuthTokenResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async getUser(token: string): Promise<TwitchConnectionUserResponse> {
		const url = new URL(this.userInfoUrl);

		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
				"Client-Id": this.settings.clientId!,
			})
			.get()
			.json<TwitchConnectionUserResponse>()
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

		const exists = await this.hasConnection(userId, userInfo.data[0].id);

		if (exists) return null;

		return await this.createConnection({
			token_data: { ...tokenData, fetched_at: Date.now() },
			user_id: userId,
			external_id: userInfo.data[0].id,
			friend_sync: params.friend_sync,
			name: userInfo.data[0].display_name,
			type: this.id,
		});
	}
}
