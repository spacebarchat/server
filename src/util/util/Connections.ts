import {
	RedditConnection,
	EpicGamesConnection,
	YouTubeConnection,
	TwitchConnection,
	BattleNetConnection,
	FacebookConnection,
	TwitterConnection,
	SpotifyConnection,
	XboxConnection,
	SteamConnection
} from "../connections";
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
		battlenet: new BattleNetConnection(),
		epicgames: new EpicGamesConnection(),
		facebook: new FacebookConnection(),
		github: new GitHubConnection(),
		reddit: new RedditConnection(),
		spotify: new SpotifyConnection(),
		steam: new SteamConnection(),
		twitch: new TwitchConnection(),
		twitter: new TwitterConnection(),
		xbox: new XboxConnection(),
		youtube: new YouTubeConnection()
	},
	init: () => {
		for (const connection of Object.values(Connections.connections)) {
			connection.init();
		}
	}
};
