import { Config, ConnectedAccount, DiscordApiErrors, OAuthConnectionConfiguration } from "@fosscord/util";
import crypto from "crypto";

export interface ConnectionOptions {
	id: string;
	authorizeUrl: string;
	tokenUrl: string;
	userInfoUrl: string;
	scopes: string[];
}

export interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

export abstract class BaseOAuthConnection {
	public options: ConnectionOptions;
	public enabled: boolean = false;
	public clientId: string;
	public clientSecret: string;
	public readonly states: Map<string, string> = new Map();

	constructor(options: ConnectionOptions) {
		this.options = options;
	}

	init(): void {
		const config = (Config.get().connections as unknown as { [key: string]: OAuthConnectionConfiguration })[this.options.id];
		if (!config) {
			console.warn(`No configuration found for connection ${this.options.id}`);
			return;
		}
		this.enabled = config.enabled;
		if (config.enabled && !(config.clientId || config.clientSecret)) {
			console.warn(`Connection ${this.options.id} is enabled but has no client ID or client secret. Connection will be disabled.`);
			this.enabled = false;
			return;
		}
		this.clientId = config.clientId!;
		this.clientSecret = config.clientSecret!;
	}

	createState(user_id: string): string {
		const state = crypto.randomBytes(16).toString("hex");
		this.states.set(state, user_id);

		return state;
	}

	validateState(state: string): void {
		if (!this.states.has(state)) throw DiscordApiErrors.INVALID_OAUTH_STATE;
		this.states.delete(state);
	}

	isEnabled(): boolean {
		console.log(this.clientId, this.clientSecret, this.enabled);
		return !!(this.clientId && this.clientSecret && this.enabled);
	}

	getUserIdFromState(state: string): string | undefined {
		return this.states.get(state);
	}

	abstract makeAuthorizeUrl(user_id: string): string;

	abstract makeTokenUrl(code: string): string;

	abstract exchangeCode(code: string, state: string): Promise<string>;

	abstract getUser(token: string): Promise<unknown>;

	abstract createConnection(userId: string, friend_sync: boolean, userInfo: unknown, token: string): ConnectedAccount;

	abstract hasConnection(userId: string, userInfo: unknown): Promise<boolean>;
}
