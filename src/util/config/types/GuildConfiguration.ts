import { DiscoveryConfiguration, AutoJoinConfiguration } from ".";

export class GuildConfiguration {
    discovery: DiscoveryConfiguration = new DiscoveryConfiguration();
    autoJoin: AutoJoinConfiguration = new AutoJoinConfiguration();
	defaultFeatures: string[] = [];
}
