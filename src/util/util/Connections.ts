import { BaseOAuthConnection } from "../connections/BaseOAuthConnection";
import { BaseOIDConnection } from "../connections/BaseOIDConnection";
import { GitHubConnection } from "../connections/GitHubConnection";

export interface ConnectionAuthCallbackSchema {
	code?: string;
	friend_sync: boolean;
	insecure: boolean;
	state?: string;
	openid_params?: {
		"openid.assoc_handle": string;
		"openid.claimed_id": string;
		"openid.identity": string;
		"openid.mode": string;
		"openid.ns": string;
		"openid.op_endpoint": string;
		"openid.response_nonce": string;
		"openid.return_to": string;
		"openid.sig": string;
		"openid.signed": string;
	};
}

export const Connections: {
	connections: { [key: string]: BaseOAuthConnection | BaseOIDConnection };
	init: () => void;
} = {
	connections: {
		github: new GitHubConnection()
		// reddit: new RedditConnection(),
		// epicgames: new EpicGamesConnection(),
		// youtube: new YouTubeConnection(),
		// twitch: new TwitchConnection(),
		// battlenet: new BattleNetConnection(),
		// facebook: new FacebookConnection(),
		// twitter: new TwitterConnection(),
		// spotify: new SpotifyConnection(),
		// xbox: new XboxConnection(),
		// steam: new SteamConnection()
	},
	init: () => {
		for (const connection of Object.values(Connections.connections)) {
			connection.init();
		}
	}
};
