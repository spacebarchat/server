import fetch from "node-fetch";
import { ConnectedAccount } from "../entities";
import { OIDConnectionCallbackSchema } from "../schemas/ConnectionAuthCallbackSchema";
import { Config, DiscordApiErrors, OrmUtils } from "../util";
import { BaseOIDConnection } from "./BaseOIDConnection";

export interface SteamConnectionUserInfo {
	steamid: string;
	username: string;
	name: string;
}

export class SteamConnection extends BaseOIDConnection {
	public apiKey: string | null;
	constructor() {
		super({
			id: "steam",
			identifier: "https://steamcommunity.com/openid"
		});
	}

	initCustom(): void {
		this.apiKey = Config.get().connections.steam.apiKey;
	}

	/**
	 * Validates the state and the response signature and returns the users id
	 * @param param the openid callback parameters
	 * @returns the users steam id
	 */
	async exchangeCode({ state, openid_params }: OIDConnectionCallbackSchema): Promise<string> {
		this.validateState(state);
		return new Promise((resolve, reject) => {
			this.verifyAssertion(openid_params)
				.then((r) => {
					if (!r.authenticated) {
						return reject(DiscordApiErrors.INVALID_OAUTH_STATE);
					}
					const claimedIdentifier = openid_params["openid.claimed_id"];
					const steamId = claimedIdentifier.replace("https://steamcommunity.com/openid/id/", "");
					resolve(steamId);
				})
				.catch(reject);
		});
	}

	async getUser(steamId: string): Promise<SteamConnectionUserInfo> {
		return new Promise((resolve, reject) => {
			fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`)
				.then((res) => res.json())
				.then((res) => {
					if (!res.response || !res.response.players) return reject(new Error("Failed to get user info"));
					const user = res.response.players[0];
					resolve({
						steamid: user.steamid,
						username: user.personaname,
						name: user.realname
					} as SteamConnectionUserInfo);
				})
				.catch(reject);
		});
	}

	createConnection(userId: string, friend_sync: boolean, userInfo: SteamConnectionUserInfo): ConnectedAccount {
		return OrmUtils.mergeDeep(new ConnectedAccount(), {
			user_id: userId,
			external_id: userInfo.steamid,
			friend_sync: friend_sync,
			name: userInfo.username,
			revoked: false,
			show_activity: false,
			type: this.options.id,
			verified: true,
			visibility: 0,
			integrations: []
		});
	}

	async hasConnection(userId: string, userInfo: SteamConnectionUserInfo): Promise<boolean> {
		const existing = await ConnectedAccount.findOne({
			where: {
				user_id: userId,
				external_id: userInfo.steamid
			}
		});

		return !!existing;
	}
}
