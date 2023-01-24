/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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
	Config,
	ConnectedAccount,
	ConnectedAccountCommonOAuthTokenResponse,
	ConnectionCallbackSchema,
	ConnectionLoader,
	DiscordApiErrors,
} from "@fosscord/util";
import wretch from "wretch";
import Connection from "../../util/connections/Connection";
import { YoutubeSettings } from "./YoutubeSettings";

interface YouTubeConnectionChannelListResult {
	items: {
		snippet: {
			// thumbnails: Thumbnails;
			title: string;
			country: string;
			publishedAt: string;
			// localized: Localized;
			description: string;
		};
		kind: string;
		etag: string;
		id: string;
	}[];
	kind: string;
	etag: string;
	pageInfo: {
		resultsPerPage: number;
		totalResults: number;
	};
}

export default class YoutubeConnection extends Connection {
	public readonly id = "youtube";
	public readonly authorizeUrl =
		"https://accounts.google.com/o/oauth2/v2/auth";
	public readonly tokenUrl = "https://oauth2.googleapis.com/token";
	public readonly userInfoUrl =
		"https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet";
	public readonly scopes = [
		"https://www.googleapis.com/auth/youtube.readonly",
	];
	settings: YoutubeSettings = new YoutubeSettings();

	init(): void {
		this.settings = ConnectionLoader.getConnectionConfig(
			this.id,
			this.settings,
		) as YoutubeSettings;
	}

	getAuthorizationUrl(userId: string): string {
		if (!this.settings.clientId)
			throw new Error("Connection clientId must not be null");

		const state = this.createState(userId);
		const url = new URL(this.authorizeUrl);

		url.searchParams.append("client_id", this.settings.clientId);
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
		if (!this.settings.clientId)
			throw new Error("Connection clientId must not be null");
		if (!this.settings.clientSecret)
			throw new Error("Connection clientSecret must not be null");

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
					client_id: this.settings.clientId,
					client_secret: this.settings.clientSecret,
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

	async getUser(token: string): Promise<YouTubeConnectionChannelListResult> {
		const url = new URL(this.userInfoUrl);
		return wretch(url.toString())
			.headers({
				Authorization: `Bearer ${token}`,
			})
			.get()
			.json<YouTubeConnectionChannelListResult>()
			.catch((e) => {
				console.error(e);
				throw DiscordApiErrors.GENERAL_ERROR;
			});
	}

	async handleCallback(
		params: ConnectionCallbackSchema,
	): Promise<ConnectedAccount | null> {
		if (!params.code)
			throw new Error("OAuth code is required for this connection");
		const userId = this.getUserId(params.state);
		const tokenData = await this.exchangeCode(params.state, params.code);
		const userInfo = await this.getUser(tokenData.access_token);

		const exists = await this.hasConnection(userId, userInfo.items[0].id);

		if (exists) return null;

		return await this.createConnection({
			token_data: { ...tokenData, fetched_at: Date.now() },
			user_id: userId,
			external_id: userInfo.items[0].id,
			friend_sync: params.friend_sync,
			name: userInfo.items[0].snippet.title,
			type: this.id,
		});
	}
}
