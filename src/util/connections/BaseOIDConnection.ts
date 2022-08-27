import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import { RelyingParty } from "@puyodead1/openid";
import crypto from "crypto";
import { OIDConnectionCallbackParams, OIDConnectionCallbackSchema } from "../schemas/ConnectionAuthCallbackSchema";

interface ConnectionOptions {
	id: string;
	identifier: string;
}

/**
 * Base Class for OpenID version 1 and 2 (NOT openid connect) connections.
 */
export abstract class BaseOIDConnection {
	public readonly options: ConnectionOptions;
	public realm: string;
	public returnUrl: string;
	public relyingParty: RelyingParty;
	public enabled: boolean = false;
	public readonly states: Map<string, string> = new Map();

	constructor(options: ConnectionOptions) {
		this.options = options;
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

	init(): void {
		const config = (Config.get().connections as unknown as { [key: string]: BaseOIDConnection })[this.options.id];
		this.enabled = config.enabled;
		this.realm = Config.get().general.frontPage || "http://localhost:3001";
		this.relyingParty = new RelyingParty(this.realm, true, true, []);
		this.initCustom();
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	async makeAuthorizeUrl(userId: string): Promise<String> {
		return new Promise((resolve, reject) => {
			const state = this.createState(userId);
			const returnUrl = `${Config.get().cdn.endpointPrivate || "http://localhost:3001"}/connections/${
				this.options.id
			}/callback?state=${state}`;
			this.relyingParty.authenticate(this.options.identifier, returnUrl, false, (error, authUrl) => {
				if (error) return reject(error);
				if (!authUrl) return reject(new Error(`Failed to make authorize url for ${this.options.identifier}`));

				resolve(authUrl);
			});
		});
	}

	getUserIdFromState(state: string): string | undefined {
		return this.states.get(state);
	}

	abstract exchangeCode(body: OIDConnectionCallbackSchema): Promise<string>;

	abstract initCustom(): void;

	abstract getUser(token: string): Promise<unknown>;

	abstract createConnection(userId: string, friend_sync: boolean, userInfo: unknown, token: string): ConnectedAccount;

	abstract hasConnection(userId: string, userInfo: unknown): Promise<boolean>;

	/**
	 * validates the response
	 * @param params openid params from the response
	 * @returns object containing a boolean indicating if the response is valid and the claimed id
	 */
	async verifyAssertion(params: OIDConnectionCallbackParams): Promise<{
		authenticated: boolean;
		claimedIdentifier?: string | undefined;
	}> {
		return new Promise((resolve, reject) => {
			this.relyingParty._verifyAssertionData(params, (err, result) => {
				if (err) return reject(err);
				if (!result) return reject(new Error("No result"));
				resolve(result);
			});
		});
	}
}
