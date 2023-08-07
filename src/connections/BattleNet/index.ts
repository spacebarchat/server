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
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
	Connection,
} from "@spacebar/util";
import wretch from "wretch";
import { BattleNetSettings } from "./BattleNetSettings";

interface BattleNetConnectionUser {
	sub: string;
	id: number;
	battletag: string;
}

// interface BattleNetErrorResponse {
// 	error: string;
// 	error_description: string;
// }

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
		url.searchParams.append("redirect_uri", this.getRedirectUri());
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

		return wretch(url.toString())
			.headers({
				Accept: "application/json",
			})
			.body(
				new URLSearchParams({
					grant_type: "authorization_code",
					code: code,
					client_id: this.settings.clientId!,
					client_secret: this.settings.clientSecret!,
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

	async getUser(token: string): Promise<BattleNetConnectionUser> {
		const url = new URL(this.userInfoUrl);
		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
			})
			.get()
			.json<BattleNetConnectionUser>()
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
