import fetch from "node-fetch";
import {
	Config,
	ConnectedAccount,
	ConnectionCallbackSchema,
	DiscordApiErrors,
	ConnectionLoader,
} from "@fosscord/util";
import Connection from "../../util/connections/Connection";
import { DiscordSettings } from "./DiscordSettings";

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

interface UserResponse {
	id: string;
	username: string;
	avatar_url: string | null;
}

export default class DiscordConnection extends Connection {
	public readonly id = "discord";
	public readonly authorizeUrl = "https://discord.com/oauth2/authorize";
	public readonly tokenUrl = "https://discord.com/oauth2/token";
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

		// TODO: probably shouldn't rely on cdn as this could be different from what we actually want. we should have an api endpoint setting.
		url.searchParams.append(
			"redirect_uri",
			`${Config.get().cdn.endpointPrivate || "http://localhost:3001"
			}/connections/${this.id}/callback`,
		);

		return url.toString();
	}

	getTokenUrl(code: string): string {
		const url = new URL(this.tokenUrl);
		url.searchParams.append("client_id", this.settings.clientId!);
		url.searchParams.append("client_secret", this.settings.clientSecret!);
		url.searchParams.append("grant_type", "authorization_code");
		url.searchParams.append("code", code);
		return url.toString();
	}

	async exchangeCode(state: string, code: string): Promise<string> {
		this.validateState(state);
		const url = this.getTokenUrl(code);

		return fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res) => res.json())
			.then((res: OAuthTokenResponse) => res.access_token)
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
		}).then((res) => res.json());
	}

	async handleCallback(params: ConnectionCallbackSchema): Promise<ConnectedAccount | null> {
		const userId = this.getUserId(params.state);
		const token = await this.exchangeCode(params.state, params.code!);
		const userInfo = await this.getUser(token);

		const exists = await this.hasConnection(userId, userInfo.id);

		if (exists) return null;

		return await this.createConnection({
			user_id: userId,
			external_id: userInfo.id,
			friend_sync: params.friend_sync,
			name: userInfo.username,
			type: this.id,
		})
	}
}