export class BaseConnectionConfiguration {
	enabled: boolean = false;
}

export class OAuthConnectionConfiguration extends BaseConnectionConfiguration {
	clientId: string | null;
	clientSecret: string | null;
}

export class SteamConnectionConfiguration extends BaseConnectionConfiguration {
	apiKey: string | null;
}

export class ConnectionsConfiguration {
	battlenet = new OAuthConnectionConfiguration();
	epicgames = new OAuthConnectionConfiguration();
	facebook = new OAuthConnectionConfiguration();
	github = new OAuthConnectionConfiguration();
	reddit = new OAuthConnectionConfiguration();
	spotify = new OAuthConnectionConfiguration();
	steam = new SteamConnectionConfiguration();
	twitch = new OAuthConnectionConfiguration();
	twitter = new OAuthConnectionConfiguration();
	xbox = new OAuthConnectionConfiguration();
	youtube = new OAuthConnectionConfiguration();
}
