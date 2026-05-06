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

import { ConnectedAccount, ConnectionLoader, DiscordApiErrors, RefreshableConnection } from "@spacebar/util";
import crypto from "node:crypto";
import wretch from "wretch";
import { GenericOAuthSettings as TwitterSettings } from "../GenericOAuthSettings";
import { ConnectedAccountCommonOAuthTokenResponse, ConnectionCallbackSchema } from "@spacebar/schemas";

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

// interface TwitterErrorResponse {
// 	error: string;
// 	error_description: string;
// }

export interface TwitterPKCEPair {
    verifier: string;
    challenge: string;
}

export function createTwitterPKCEPair(): TwitterPKCEPair {
    const verifier = crypto.randomBytes(32).toString("base64url");
    const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");

    return { verifier, challenge };
}

export function createTwitterAuthorizationCodeBody(params: { code: string; clientId: string; redirectUri: string; codeVerifier: string }) {
    return new URLSearchParams({
        grant_type: "authorization_code",
        code: params.code,
        client_id: params.clientId,
        redirect_uri: params.redirectUri,
        code_verifier: params.codeVerifier,
    });
}

export function createTwitterRefreshTokenBody(params: { refreshToken: string; clientId: string }) {
    return new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: params.refreshToken,
        client_id: params.clientId,
    });
}

export default class TwitterConnection extends RefreshableConnection {
    public readonly id = "twitter";
    public friendlyName = "Twitter";
    public setupUrl = "https://console.x.com";
    public requiredScopes = []; //no scopes nessecary

    public readonly authorizeUrl = "https://twitter.com/i/oauth2/authorize";
    public readonly tokenUrl = "https://api.twitter.com/2/oauth2/token";
    public readonly userInfoUrl = "https://api.twitter.com/2/users/me?user.fields=created_at%2Cdescription%2Cid%2Cname%2Cusername%2Cverified%2Clocation%2Curl";
    public readonly scopes = ["users.read", "tweet.read", "offline.access"];
    settings: TwitterSettings = new TwitterSettings();

    init(): void {
        this.settings = ConnectionLoader.getConnectionConfig<TwitterSettings>(this.id, this.settings);

        if (this.settings.enabled && (!this.settings.clientId || !this.settings.clientSecret)) throw new Error(`Invalid settings for connection ${this.id}`);
    }

    public get isConfigured(): boolean {
        return !!this.settings.clientId && !!this.settings.clientSecret;
    }

    getAuthorizationUrl(userId: string): string {
        const pkce = createTwitterPKCEPair();
        const state = this.createState(userId, { codeVerifier: pkce.verifier });

        const url = new URL(this.authorizeUrl);

        url.searchParams.append("client_id", this.settings.clientId as string);
        url.searchParams.append("redirect_uri", this.getRedirectUri());
        url.searchParams.append("response_type", "code");
        url.searchParams.append("scope", this.scopes.join(" "));
        url.searchParams.append("state", state);
        url.searchParams.append("code_challenge", pkce.challenge);
        url.searchParams.append("code_challenge_method", "S256");
        return url.toString();
    }

    getTokenUrl(): string {
        return this.tokenUrl;
    }

    async exchangeCode(state: string, code: string): Promise<ConnectedAccountCommonOAuthTokenResponse> {
        const code_verifier = this.consumePKCEVerifier(state);

        const url = this.getTokenUrl();

        return wretch(url.toString())
            .headers({
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${this.settings.clientId as string}:${this.settings.clientSecret as string}`).toString("base64")}`,
            })
            .body(
                createTwitterAuthorizationCodeBody({
                    code,
                    clientId: this.settings.clientId as string,
                    redirectUri: this.getRedirectUri(),
                    codeVerifier: code_verifier,
                }),
            )
            .post()
            .json<ConnectedAccountCommonOAuthTokenResponse>()
            .catch((e) => {
                console.error(e);
                throw DiscordApiErrors.GENERAL_ERROR;
            });
    }

    async refreshToken(connectedAccount: ConnectedAccount): Promise<ConnectedAccountCommonOAuthTokenResponse> {
        if (!connectedAccount.token_data?.refresh_token) throw new Error("No refresh token available.");
        const refresh_token = connectedAccount.token_data.refresh_token;

        const url = this.getTokenUrl();

        return wretch(url.toString())
            .headers({
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${this.settings.clientId as string}:${this.settings.clientSecret as string}`).toString("base64")}`,
            })
            .body(
                createTwitterRefreshTokenBody({
                    refreshToken: refresh_token,
                    clientId: this.settings.clientId as string,
                }),
            )
            .post()
            .json<ConnectedAccountCommonOAuthTokenResponse>()
            .catch((e) => {
                console.error(e);
                throw DiscordApiErrors.GENERAL_ERROR;
            });
    }

    async getUser(token: string): Promise<TwitterUserResponse> {
        const url = new URL(this.userInfoUrl);
        return wretch(url.toString())
            .headers({
                Authorization: `Bearer ${token}`,
            })
            .get()
            .json<TwitterUserResponse>()
            .catch((e) => {
                console.error(e);
                throw DiscordApiErrors.GENERAL_ERROR;
            });
    }

    private consumePKCEVerifier(state: string): string {
        const { data } = this.consumeState(state);
        const verifier = data.codeVerifier;
        if (typeof verifier !== "string") throw DiscordApiErrors.INVALID_OAUTH_STATE;
        return verifier;
    }

    async handleCallback(params: ConnectionCallbackSchema): Promise<ConnectedAccount | null> {
        const { state, code } = params;
        if (!code) throw new Error("No code provided");

        const userId = this.getUserId(state);
        const tokenData = await this.exchangeCode(state, code);
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
