/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { Config } from "@fosscord/util";
import { Request } from "express";
// use ipdata package instead of simple fetch because of integrated caching
import fetch from "node-fetch";

const exampleData = {
	status: "success",
	result: "0",
	queryIP: "",
	queryFlags: null,
	queryOFlags: null,
	queryFormat: "json",
	contact: "",
	Country: "",
};

function isPrivateIP(ip: string) {
	var parts = ip.split(".");
	return (
		parts[0] === "10" ||
		(parts[0] === "172" &&
			parseInt(parts[1], 10) >= 16 &&
			parseInt(parts[1], 10) <= 31) ||
		(parts[0] === "192" && parts[1] === "168")
	);
}

//TODO add function that support both ip and domain names
export async function IPAnalysis(ip: string): Promise<typeof exampleData> {
	const { correspondenceEmail } = Config.get().general;
	if (!correspondenceEmail) return { ...exampleData, queryIP: ip };
	// This next bit is a hot mess, but hey, it beats rate limiting
	if (isPrivateIP(ip)) return { ...exampleData, queryIP: ip };
	return (
		await fetch(
			`http://check.getipintel.net/check.php?ip=${ip}&contact=${correspondenceEmail}&format=json&oflags=c`,
		)
	).json() as any; // TODO: types
}

export function isProxy(data: typeof exampleData) {
	if (process.env.NODE_ENV === "development")
		console.log(`IP Analysis: ${JSON.stringify(data)}`);
	if (data.result.toNumber() > 0.9) return true;

	return false;
}

export function getIpAdress(req: Request): string {
	return (
		// @ts-ignore
		req.headers[Config.get().security.forwadedFor] ||
		req.socket.remoteAddress
	);
}

export function distanceBetweenLocations(loc1: any, loc2: any): number {
	return distanceBetweenCoords(
		loc1.latitude,
		loc1.longitude,
		loc2.latitude,
		loc2.longitude,
	);
}

//Haversine function
function distanceBetweenCoords(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const p = 0.017453292519943295; // Math.PI / 180
	const c = Math.cos;
	const a =
		0.5 -
		c((lat2 - lat1) * p) / 2 +
		(c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

	return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
