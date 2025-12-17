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

export type AbuseIpDbCheckResponse = typeof abuseIpDbCheckResponseSample;
export type AbuseIpDbBlacklistResponse = typeof abuseIpDbBlacklistResponseSample;

const abuseIpDbCheckResponseSample = {
    data: {
        ipAddress: "118.25.6.39",
        isPublic: true,
        ipVersion: 4,
        isWhitelisted: false,
        abuseConfidenceScore: 100,
        countryCode: "CN",
        countryName: "China",
        usageType: "Data Center/Web Hosting/Transit",
        isp: "Tencent Cloud Computing (Beijing) Co. Ltd",
        domain: "tencent.com",
        hostnames: [],
        isTor: false,
        totalReports: 1,
        numDistinctUsers: 1,
        lastReportedAt: "2018-12-20T20:55:14+00:00",
        reports: [
            {
                reportedAt: "2018-12-20T20:55:14+00:00",
                comment: "Dec 20 20:55:14 srv206 sshd[13937]: Invalid user oracle from 118.25.6.39",
                categories: [18, 22],
                reporterId: 1,
                reporterCountryCode: "US",
                reporterCountryName: "United States",
            },
        ],
    },
};

const abuseIpDbBlacklistResponseSample = {
    meta: {
        generatedAt: "2020-09-24T19:54:11+00:00",
    },
    data: [
        {
            ipAddress: "5.188.10.179",
            abuseConfidenceScore: 100,
            lastReportedAt: "2020-09-24T19:17:02+00:00",
        },
        {
            ipAddress: "185.222.209.14",
            abuseConfidenceScore: 100,
            lastReportedAt: "2020-09-24T19:17:02+00:00",
        },
        {
            ipAddress: "191.96.249.183",
            abuseConfidenceScore: 100,
            lastReportedAt: "2020-09-24T19:17:01+00:00",
        },
    ],
};
