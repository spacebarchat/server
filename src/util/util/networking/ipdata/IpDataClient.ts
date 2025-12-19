import { Config, DateBuilder } from "@spacebar/util";
import { IpDataIpLookupResponse } from "./IpDataSampleResponses";

export class IpDataClient {
    private static ipInfoCache: Map<
        string,
        {
            data: IpDataIpLookupResponse;
            expires: number;
        }
    > = new Map();

    static async getIpInfo(ip: string): Promise<IpDataIpLookupResponse | null> {
        const { ipdataApiKey } = Config.get().security;
        if (!ipdataApiKey) return null;
        if (this.ipInfoCache.get(ip)?.expires ?? 0 > Date.now()) return this.ipInfoCache.get(ip)!.data;

        console.log(`[IpData] Fetching info for IP address ${ip}...`);
        const response = await fetch(`https://eu-api.ipdata.co/${ip}?api-key=${ipdataApiKey}`);
        const data = (await response.json()) as IpDataIpLookupResponse;
        this.ipInfoCache.set(ip, {
            data: data,
            expires: new DateBuilder().addHours(12).buildTimestamp(),
        });
        return data;
    }
}
