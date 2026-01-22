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

import { DateBuilder } from "@spacebar/util";

// https://www.stopforumspam.com/usage
export class StopForumSpamClient {
    private static stopForumSpamIpCache: Map<
        string,
        {
            data: StopForumSpamResponse["ip"];
            expires: number;
        }
    > = new Map();
    private static stopForumSpamEmailCache: Map<
        string,
        {
            data: StopForumSpamResponse["email"];
            expires: number;
        }
    > = new Map();
    private static stopForumSpamUsernameCache: Map<
        string,
        {
            data: StopForumSpamResponse["username"];
            expires: number;
        }
    > = new Map();

    public static async checkAsync(email?: string, ipAddress?: string, username?: string): Promise<StopForumSpamResponse> {
        const params = new URLSearchParams();
        const cachedResults: StopForumSpamResponse = { success: 1 };
        if (email) {
            const cachedEmail = StopForumSpamClient.stopForumSpamEmailCache.get(email);
            if (cachedEmail && cachedEmail.expires > Date.now()) cachedResults.email = cachedEmail.data;
            else params.append("email", email);
        }
        if (ipAddress) {
            const cachedIp = StopForumSpamClient.stopForumSpamIpCache.get(ipAddress);
            if (cachedIp && cachedIp.expires > Date.now()) cachedResults.ip = cachedIp.data;
            else params.append("ip", ipAddress);
        }
        if (username) {
            const cachedUsername = StopForumSpamClient.stopForumSpamUsernameCache.get(username);
            if (cachedUsername && cachedUsername.expires > Date.now()) cachedResults.username = cachedUsername.data;
            else params.append("username", username);
        }

        if (params.toString() === "") {
            // We don't need to fetch anything...
            console.log("[StopForumSpamClient] Using cached results for all parameters:", { email, ipAddress, username });
            return cachedResults;
        }

        const response = await fetch(`https://api.stopforumspam.org/api?${params.toString()}&json&confidence`, {
            method: "GET",
        });

        if (!response.ok) {
            console.error(`StopForumSpam API request failed with status ${response.status}`);
            console.error(await response.text());
            throw new Error(`StopForumSpam API request failed with status ${response.status}`);
        }

        const data = (await response.json()) as StopForumSpamResponse;
        if (data.success !== 1) {
            console.error("StopForumSpam API request was not successful", data);
            throw new Error("StopForumSpam API request was not successful");
        }

        if (data.ip)
            StopForumSpamClient.stopForumSpamIpCache.set(data.ip.value, {
                data: data.ip,
                expires: new DateBuilder().addHours(12).buildTimestamp(),
            });

        if (data.email)
            StopForumSpamClient.stopForumSpamEmailCache.set(data.email.value, {
                data: data.email,
                expires: new DateBuilder().addHours(12).buildTimestamp(),
            });

        if (data.username)
            StopForumSpamClient.stopForumSpamUsernameCache.set(data.username.value, {
                data: data.username,
                expires: new DateBuilder().addHours(12).buildTimestamp(),
            });

        return data;
    }
}
export interface StopForumSpamResponse {
    success: 0 | 1;
    ip?: {
        value: string;
        appears: 0 | 1;
        lastseen: string;
        frequency: number;
        confidence?: number;
        delegated: string;
    };
    email?: {
        value: string;
        appears: 0 | 1;
        lastseen: string;
        frequency: number;
        confidence?: number;
    };
    username?: {
        value: string;
        appears: 0 | 1;
        lastseen: string;
        frequency: number;
        confidence?: number;
    };
}
