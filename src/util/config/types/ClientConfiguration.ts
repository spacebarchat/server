import { ClientReleaseConfiguration } from ".";

export class ClientConfiguration {
	releases: ClientReleaseConfiguration = new ClientReleaseConfiguration();
	useTestClient: boolean = false;
}
