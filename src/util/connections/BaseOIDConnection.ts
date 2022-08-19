import { Config, ConnectedAccount, DiscordApiErrors } from "@fosscord/util";
import { RelyingParty } from "openid";
import crypto from "crypto";

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

	// TODO: add state to return url
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
		this.returnUrl = `${Config.get().cdn.endpointPrivate}/connections/${this.options.id}/callback`;

		this.relyingParty = new RelyingParty(this.returnUrl, this.realm, true, true, []);

		this.initCustom();
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	async makeAuthorizeUrl(): Promise<String> {
		return new Promise((resolve, reject) => {
			this.relyingParty.authenticate(this.options.identifier, false, (error, authUrl) => {
				if (error) return reject(error);
				if (!authUrl) return reject(new Error(`Failed to make authorize url for ${this.options.identifier}`));

				resolve(authUrl);
			});
		});
	}

	getUserIdFromState(state: string): string | undefined {
		return this.states.get(state);
	}

	abstract exchangeCode(claimedIdentifier: string, state: string): string;

	abstract initCustom(): void;

	abstract getUser(token: string): Promise<unknown>;

	abstract createConnection(userId: string, friend_sync: boolean, userInfo: unknown, token: string): ConnectedAccount;
}
