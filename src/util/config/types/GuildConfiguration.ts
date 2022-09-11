import { AutoJoinConfiguration, DiscoveryConfiguration } from ".";

export class GuildConfiguration {
	discovery: DiscoveryConfiguration = new DiscoveryConfiguration();
	autoJoin: AutoJoinConfiguration = new AutoJoinConfiguration();
	publicThreadsInvitable: boolean = false;
}
