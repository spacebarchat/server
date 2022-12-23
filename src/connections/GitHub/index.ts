import {
	Config,
	ConnectedAccount,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import fetch from "node-fetch";
import Connection from "../../util/connections/Connection";
import { GitHubSettings } from "./GitHubSettings";

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

interface UserResponse {
	login: string;
	id: number;
	name: string;
}

export default class GitHubConnection extends Connection {
	public readonly id = "github";
	public readonly authorizeUrl = "https://github.com/login/oauth/authorize";
	public readonly tokenUrl = "https://github.com/login/oauth/access_token";
	public readonly userInfoUrl = "https://api.github.com/user";
	public readonly scopes = ["read:user"];
	settings: GitHubSettings = new GitHubSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as GitHubSettings;
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
		return url.toString();
	}

	getTokenUrl(code: string): string {
		const url = new URL(this.tokenUrl);
		url.searchParams.append("client_id", this.settings.clientId!);
		url.searchParams.append("client_secret", this.settings.clientSecret!);
		url.searchParams.append("code", code);
		return url.toString();
	}

	async exchangeCode(state: string, code: string): Promise<string> {
		this.validateState(state);

		const url = this.getTokenUrl(code);

		return fetch(url.toString(), {
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
			name: userInfo.login,
			type: this.id,
		});
	}
}
