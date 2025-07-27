/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Config, distanceBetweenLocations, IPAnalysis } from "@spacebar/util";

export async function getVoiceRegions(ipAddress: string, vip: boolean) {
	const regions = Config.get().regions;
	const availableRegions = regions.available.filter((ar) =>
		vip ? true : !ar.vip,
	);
	let optimalId = regions.default;

	if (!regions.useDefaultAsOptimal) {
		const clientIpAnalysis = await IPAnalysis(ipAddress);

		let min = Number.POSITIVE_INFINITY;

		for (const ar of availableRegions) {
			//TODO the endpoint location should be saved in the database if not already present to prevent IPAnalysis call
			const dist = distanceBetweenLocations(
				clientIpAnalysis,
				ar.location || (await IPAnalysis(ar.endpoint)),
			);

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
		optimal: ar.id === optimalId,
	}));
}
