import { Config } from "@fosscord/util";
import { distanceBetweenLocations, IPAnalysis } from "./ipAddress";

export async function getVoiceRegions(ipAddress: string, vip: boolean) {
	const regions = Config.get().regions;
	const availableRegions = regions.available.filter((ar) => (vip ? true : !ar.vip));
	let optimalId = regions.default;

	if (!regions.useDefaultAsOptimal) {
		const clientIpAnalysis = await IPAnalysis(ipAddress);

		let min = Number.POSITIVE_INFINITY;

		for (let ar of availableRegions) {
			//TODO the endpoint location should be saved in the database if not already present to prevent IPAnalysis call
			const dist = distanceBetweenLocations(clientIpAnalysis, ar.location || (await IPAnalysis(ar.endpoint)));

			if (dist < min) {
				min = dist;
				optimalId = ar.id;
			}
		}
	}

	return availableRegions.map((ar) => ({
		id: ar.id,
		name: ar.name,
		custom: ar.custom,
		deprecated: ar.deprecated,
		optimal: ar.id === optimalId
	}));
}
