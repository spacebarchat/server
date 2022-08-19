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
	github = new OAuthConnectionConfiguration();
}
