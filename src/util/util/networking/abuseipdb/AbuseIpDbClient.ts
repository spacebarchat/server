/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { DateBuilder } from "@spacebar/extensions";
import { Config } from "@spacebar/util";
import { AbuseIpDbBlacklistResponse, AbuseIpDbCheckResponse } from "./AbuseIpDbSampleResponses";

export class AbuseIpDbClient {
    private static ipCheckCache: Map<
        string,
        {
            data: AbuseIpDbCheckResponse;
            expires: number;
        }
    > = new Map();

    private static blacklistCache: {
        data: AbuseIpDbBlacklistResponse;
        expires: number;
    } | null = null;

    static async checkIpAddress(ip: string): Promise<AbuseIpDbCheckResponse | null> {
        const { ipdataApiKey } = Config.get().security;
        if (!ipdataApiKey) return null;
        if ((this.ipCheckCache.get(ip)?.expires ?? 0) > Date.now()) return this.ipCheckCache.get(ip)!.data;

        console.log(`[AbuseIPDB] Checking IP address ${ip}...`);
        const resp = (await (await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`)).json()) as Promise<AbuseIpDbCheckResponse>;
        this.ipCheckCache.set(ip, {
            data: await resp,
            expires: new DateBuilder().addHours(12).buildTimestamp(),
        });
        return await resp;
    }

    static async getBlacklist(): Promise<AbuseIpDbBlacklistResponse | null> {
        const { abuseIpDbApiKey, abuseipdbBlacklistRatelimit } = Config.get().security;
        if (!abuseIpDbApiKey) return null;
        if ((this.blacklistCache?.expires ?? 0) > Date.now()) return this.blacklistCache!.data;

        console.log("[AbuseIPDB] Fetching blacklist...");
        const resp = (await (
            await fetch(`https://api.abuseipdb.com/api/v2/blacklist`, {
                headers: {
                    Key: abuseIpDbApiKey,
                    Accept: "application/json",
                },
            })
        ).json()) as Promise<AbuseIpDbBlacklistResponse>;

        this.blacklistCache = {
            data: await resp,
            expires: new DateBuilder().addHours(Math.ceil(24 / abuseipdbBlacklistRatelimit)).buildTimestamp(),
        };

        return await resp;
    }

    static async isIpBlacklisted(ip: string): Promise<boolean> {
        const { abuseipdbConfidenceScoreTreshold } = Config.get().security;
        const blacklist = await this.getBlacklist();
        if (!blacklist) return false;

        const entry = blacklist.data.find((x) => x.ipAddress === ip);
        if (!entry) return false;

        return entry.abuseConfidenceScore >= abuseipdbConfidenceScoreTreshold;
    }
}
