/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	Connection,
	ConnectionLoader,
	DiscordApiErrors,
} from "@spacebar/util";
import wretch from "wretch";
import { EpicGamesSettings } from "./EpicGamesSettings";
import { ConnectionCallbackSchema } from "@spacebar/schemas"

export interface UserResponse {
	accountId: string;
	displayName: string;
	preferredLanguage: string;
}

export interface EpicTokenResponse
	extends ConnectedAccountCommonOAuthTokenResponse {
	expires_at: string;
	refresh_expires_in: number;
	refresh_expires_at: string;
	account_id: string;
	client_id: string;
	application_id: string;
}

export default class EpicGamesConnection extends Connection {
	public readonly id = "epicgames";
	public readonly authorizeUrl = "https://www.epicgames.com/id/authorize";
	public readonly tokenUrl = "https://api.epicgames.dev/epic/oauth/v1/token";
	public readonly userInfoUrl =
		"https://api.epicgames.dev/epic/id/v1/accounts";
	public readonly scopes = ["basic profile"];
	settings: EpicGamesSettings = new EpicGamesSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig<EpicGamesSettings>(
			this.id,
			this.settings,
		);

		if (
			this.settings.enabled &&
			(!this.settings.clientId || !this.settings.clientSecret)
		)
			throw new Error(`Invalid settings for connection ${this.id}`);
	}

	getAuthorizationUrl(userId: string): string {
		const state = this.createState(userId);
		const url = new URL(this.authorizeUrl);

		url.searchParams.append("client_id", this.settings.clientId as string);
		url.searchParams.append("redirect_uri", this.getRedirectUri());
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
	): Promise<EpicTokenResponse> {
		this.validateState(state);

		const url = this.getTokenUrl();

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
				Authorization: `Basic ${Buffer.from(
					`${this.settings.clientId}:${this.settings.clientSecret}`,
				).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded",
			})
			.body(
				new URLSearchParams({
					grant_type: "authorization_code",
					code,
				}),
			)
			.post()
			.json<EpicTokenResponse>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async getUser(token: string): Promise<UserResponse[]> {
		const { sub } = JSON.parse(
			Buffer.from(token.split(".")[1], "base64").toString("utf8"),
		);
		const url = new URL(this.userInfoUrl);
		url.searchParams.append("accountId", sub);

		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
			})
			.get()
			.json<UserResponse[]>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		const { state, code } = params;
		if (!code) throw new Error("No code provided");

		const userId = this.getUserId(state);
		const tokenData = await this.exchangeCode(state, code);
		const userInfo = await this.getUser(tokenData.access_token);

		const exists = await this.hasConnection(userId, userInfo[0].accountId);

		if (exists) return null;

		return await this.createConnection({
			user_id: userId,
			external_id: userInfo[0].accountId,
			friend_sync: params.friend_sync,
			name: userInfo[0].displayName,
			type: this.id,
		});
	}
}
