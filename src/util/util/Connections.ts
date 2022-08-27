import {
	BattleNetConnection,
	EpicGamesConnection,
	FacebookConnection,
	RedditConnection,
	SpotifyConnection,
	SteamConnection,
	TwitchConnection,
	TwitterConnection,
	XboxConnection,
	YouTubeConnection
} from "../connections";
import { BaseOAuthConnection } from "../connections/BaseOAuthConnection";
import { BaseOIDConnection } from "../connections/BaseOIDConnection";
import { GitHubConnection } from "../connections/GitHubConnection";

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
