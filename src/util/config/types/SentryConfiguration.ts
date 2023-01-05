import { hostname } from "os";

export class SentryConfiguration {
	enabled: boolean = false;
	endpoint: string =
		"https://05e8e3d005f34b7d97e920ae5870a5e5@sentry.thearcanebrony.net/6";
	traceSampleRate: number = 1.0;
	environment: string = hostname();
}
