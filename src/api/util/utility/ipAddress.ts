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
import { Timestamp } from "typeorm";

type GetIPIntelResponse = {
	status: "success" | "error";
	result: string;
	queryIP: string;
	queryFlags: string | null;
	queryOFlags: string | null;
	queryFormat: "json";
	contact: string;
	Country?: string;
};

const GetIPIntelFallback = {
	status: "success",
	result: "0",
	queryIP: "",
	queryFlags: null,
	queryOFlags: null,
	queryFormat: "json",
	contact: "",
	Country: "US",
};

type AbuseIPDBResponse = {
	data: {
		ipAddress: string;
		isPublic: boolean;
		ipVersion: 4 | 6;
		isWhitelisted: boolean | null;
		abuseConfidenceScore: number;
		countryCode: string | null;
		countryName: string | null;
		usageType: string;
		isp: string;
		domain: string;
		hostnames: string[];
		totalReports: number;
		numDistinctUsers: number;
		lastReportedAt: string | Date | null;
		reports: object[];
	};
};

const AbuseIPDBFallback = {
	data: {
		ipAddress: "",
		isPublic: true,
		ipVersion: 4,
		isWhitelisted: false,
		abuseConfidenceScore: 0,
		countryCode: "US",
		countryName: "United States of America",
		usageType: "Fixed Line ISP",
		isp: "Fosscord",
		domain: "fosscord.com",
		hostnames: [],
		totalReports: 0,
		numDistinctUsers: 0,
		lastReportedAt: null,
		reports: [],
	},
};

type IPAnalysisResponse = {
	getipintel: GetIPIntelResponse;
	abuseipdb: AbuseIPDBResponse;
};

function isPrivateIP(ip: string) {
	if (ip === "::ffff:127.0.0.1") return true;
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

export async function IPAnalysis(ip: string): Promise<IPAnalysisResponse> {
	const { abuseIpDbEnabled, apiKey, usageTypeList, usageTypeBlacklist } =
		Config.get().security.abuseIpDb;
	const { getIpIntelEnabled, email } = Config.get().security.getIpIntel;
	var response = {
		getipintel: { ...GetIPIntelFallback, queryIP: ip },
		abuseipdb: { data: { ...AbuseIPDBFallback.data, ipAddress: ip } },
	};

	if (isPrivateIP(ip)) return response as IPAnalysisResponse;

	if (abuseIpDbEnabled) {
		const abuseipdb = await fetch(
			`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`,
			{
				headers: {
					Accept: "application/json",
					Key: apiKey as any,
				},
			},
		).then((res) => res.json());
		response.abuseipdb = abuseipdb;
	}

	if (getIpIntelEnabled) {
		const getipintel = await fetch(
			`http://check.getipintel.net/check.php?ip=${ip}&contact=${email}&format=json&oflags=c`,
		).then((res) => res.json());
		response.getipintel = getipintel;
	}
	return response as IPAnalysisResponse;
}

export function isProxy(data: IPAnalysisResponse) {
	const { usageTypeList, usageTypeBlacklist } =
		Config.get().security.abuseIpDb;
	if (process.env.NODE_ENV === "development")
		console.log(`IP Analysis:\n${JSON.stringify(data, null, 2)}`);
	if (data.getipintel.result.toNumber() > 0.9) return true;
	if (data.abuseipdb.data.abuseConfidenceScore > 90) return true;
	if (usageTypeBlacklist) {
		if (usageTypeList.includes(data.abuseipdb.data.usageType)) return true;
	} else {
		if (!usageTypeList.includes(data.abuseipdb.data.usageType)) return true;
	}

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
