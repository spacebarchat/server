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
import RefreshableConnection from "../../util/connections/RefreshableConnection";
import { TwitterSettings } from "./TwitterSettings";

interface TwitterUserResponse {
	data: {
		id: string;
		name: string;
		username: string;
		created_at: string;
		location: string;
		url: string;
		description: string;
		verified: string;
	};
}

interface TwitterErrorResponse {
	error: string;
	error_description: string;
}

export default class TwitterConnection extends RefreshableConnection {
	public readonly id = "twitter";
	public readonly authorizeUrl = "https://twitter.com/i/oauth2/authorize";
	public readonly tokenUrl = "https://api.twitter.com/2/oauth2/token";
	public readonly userInfoUrl =
		"https://api.twitter.com/2/users/me?user.fields=created_at%2Cdescription%2Cid%2Cname%2Cusername%2Cverified%2Clocation%2Curl";
	public readonly scopes = ["users.read", "tweet.read"];
	settings: TwitterSettings = new TwitterSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as TwitterSettings;
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
		url.searchParams.append("code_challenge", "challenge"); // TODO: properly use PKCE challenge
		url.searchParams.append("code_challenge_method", "plain");
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
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId!}:${this.settings.clientSecret!}`,
				).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				client_id: this.settings.clientId!,
				redirect_uri: `${
					Config.get().cdn.endpointPrivate || "http://localhost:3001"
				}/connections/${this.id}/callback`,
				code_verifier: "challenge", // TODO: properly use PKCE challenge
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
						TwitterErrorResponse,
				) => {
					if (res.error) throw new Error(res.error_description);
					return res;
				},
			)
			.catch((e) => {
				console.error(
					`Error exchanging code for ${this.id} connection: ${e}`,
				);
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

		return fetch(url.toString(), {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId!}:${this.settings.clientSecret!}`,
				).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token,
				client_id: this.settings.clientId!,
				redirect_uri: `${
					Config.get().cdn.endpointPrivate || "http://localhost:3001"
				}/connections/${this.id}/callback`,
				code_verifier: "challenge", // TODO: properly use PKCE challenge
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
						TwitterErrorResponse,
				) => {
					if (res.error) throw new Error(res.error_description);
					return res;
				},
			)
			.catch((e) => {
				console.error(
					`Error exchanging code for ${this.id} connection: ${e}`,
				);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async getUser(token: string): Promise<TwitterUserResponse> {
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
			.then((res: TwitterUserResponse & TwitterErrorResponse) => {
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

		const exists = await this.hasConnection(userId, userInfo.data.id);

		if (exists) return null;

		return await this.createConnection({
			token_data: { ...tokenData, fetched_at: Date.now() },
			user_id: userId,
			external_id: userInfo.data.id,
			friend_sync: params.friend_sync,
			name: userInfo.data.name,
			type: this.id,
		});
	}
}
