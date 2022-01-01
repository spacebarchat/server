import { Config } from "@fosscord/util";
import { Request } from "express";
// use ipdata package instead of simple fetch because of integrated caching
import fetch from "node-fetch";

const exampleData = {
	ip: "",
	is_eu: true,
	city: "",
	region: "",
	region_code: "",
	country_name: "",
	country_code: "",
	continent_name: "",
	continent_code: "",
	latitude: 0,
	longitude: 0,
	postal: "",
	calling_code: "",
	flag: "",
	emoji_flag: "",
	emoji_unicode: "",
	asn: {
		asn: "",
		name: "",
		domain: "",
		route: "",
		type: "isp"
	},
	languages: [
		{
			name: "",
			native: ""
		}
	],
	currency: {
		name: "",
		code: "",
		symbol: "",
		native: "",
		plural: ""
	},
	time_zone: {
		name: "",
		abbr: "",
		offset: "",
		is_dst: true,
		current_time: ""
	},
	threat: {
		is_tor: false,
		is_proxy: false,
		is_anonymous: false,
		is_known_attacker: false,
		is_known_abuser: false,
		is_threat: false,
		is_bogon: false
	},
	count: 0,
	status: 200
};

//TODO add function that support both ip and domain names
export async function IPAnalysis(ip: string): Promise<typeof exampleData> {
	const { ipdataApiKey } = Config.get().security;
	if (!ipdataApiKey) return { ...exampleData, ip };

	return (await fetch(`https://api.ipdata.co/${ip}?api-key=${ipdataApiKey}`)).json();
}

export function isProxy(data: typeof exampleData) {
	if (!data || !data.asn || !data.threat) return false;
	if (data.asn.type !== "isp") return true;
	if (Object.values(data.threat).some((x) => x)) return true;

	return false;
}

export function getIpAdress(req: Request): string {
	// @ts-ignore
	return req.headers[Config.get().security.forwadedFor] || req.socket.remoteAddress;
}

export function distanceBetweenLocations(loc1: any, loc2: any): number {
	return distanceBetweenCoords(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
}

//Haversine function
function distanceBetweenCoords(lat1: number, lon1: number, lat2: number, lon2: number) {
	const p = 0.017453292519943295; // Math.PI / 180
	const c = Math.cos;
	const a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

	return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
