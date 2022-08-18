import { hostname } from "os";

export class SentryConfiguration {
    enabled = false;
    endpoint = "https://05e8e3d005f34b7d97e920ae5870a5e5@sentry.thearcanebrony.net/6";
    traceSampleRate = 1.0;
    environment: string = hostname();
}
