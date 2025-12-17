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

export type DeviceInfo = {
	id: string;
	id_hash: string;
	status: string;
	activities: ActivitySchema["activities"][];
	client_status: ClientStatus;
	approx_last_used_time: string;
	client_info: {
		client: string;
		os: string;
		version: number;
		location: string;
	};
	last_seen?: Date;
	last_seen_ip?: string;
	last_seen_location?: string;
};