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

import { ActivitySchema, Snowflake } from "@spacebar/schemas";
import { ClientStatus } from "@spacebar/util";

export type SessionsLogoutSchema = { session_ids?: Snowflake[]; session_id_hashes?: string[] };
export type GetSessionsResponse = { user_sessions: DeviceInfo[]; };
/*return {
			id: this.session_id,
			id_hash: crypto.createHash("sha256").update(this.session_id).digest("hex"),
			status: this.status,
			activities: this.activities,
			client_status: this.client_status,
			approx_last_used_time: this.last_seen.toISOString(),
			client_info: {
				...this.client_info,
				location: this.last_seen_location,
			},
			last_seen: this.last_seen,
			last_seen_ip: this.last_seen_ip,
			last_seen_location: this.last_seen_location,
		};*/
export type DeviceInfo = {
	id_hash: string;
	approx_last_used_time: string;
	client_info: {
		client: string;
		os: string;
		version: number;
		location: string;
	};
	id?: string;
	status?: string;
	activities?: ActivitySchema["activities"][];
	client_status?: ClientStatus;
	last_seen?: Date;
	last_seen_ip?: string;
	last_seen_location?: string;
};