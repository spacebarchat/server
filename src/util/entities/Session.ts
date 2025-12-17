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

import crypto from "crypto";
import { User } from "./User";
import { BaseClassWithoutId } from "./BaseClass";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Activity, ClientStatus, GatewaySession, GatewaySessionClientInfo, Status } from "../interfaces";
import { randomUpperString } from "@spacebar/api";
import { IpDataIpLookupResponse } from "../util/networking/ipdata/IpDataSampleResponses";
import { DateBuilder, IpDataClient, TimeSpan } from "../util";

//TODO we need to remove all sessions on server start because if the server crashes without closing websockets it won't delete them

@Entity({
	name: "sessions",
})
export class Session extends BaseClassWithoutId {
	@PrimaryColumn({ nullable: false })
	session_id: string = randomUpperString();

	@Column()
	@RelationId((session: Session) => session.user)
	@Index({})
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column({ type: "simple-json", default: "[]" })
	activities: Activity[];

	@Column({ type: "simple-json" })
	client_info: {
		platform?: string;
		os?: string;
		version?: number;
		location?: string;
	};

	@Column({ type: "simple-json" })
	client_status: ClientStatus;

	@Column({ nullable: false, type: String })
	status: Status; //TODO enum

	@Column({ default: false })
	is_admin_session: boolean;

	@CreateDateColumn({ type: Date })
	created_at: Date;

	@Column({ nullable: true, type: Date })
	last_seen?: Date;

	@Column({ nullable: true, type: String })
	last_seen_ip?: string;

	@Column({ nullable: true, type: String })
	last_seen_location?: string;

	@Column({ nullable: true, type: "simple-json" })
	last_seen_location_info?: ExtendedLocationInfo;

	@Column({ nullable: true, type: String })
	session_nickname?: string;

	getPublicStatus() {
		return this.status === "invisible" ? "offline" : this.status;
	}

	getDiscordDeviceInfo() {
		return {
			id_hash: crypto.createHash("sha256").update(this.session_id).digest("hex"),
			approx_last_used_time: (this.last_seen ?? new Date(0)).toISOString(),
			client_info: {
				os: this.client_info?.os,
				platform:
					this.client_info?.platform + (this.client_info?.version ? ` ${this.client_info?.version}` : "") + (this.session_nickname ? ` (${this.session_nickname})` : ""),
				location: this.last_seen_location,
			},
		};
	}

	getExtendedDeviceInfo() {
		return {
			id: this.session_id,
			id_hash: crypto.createHash("sha256").update(this.session_id).digest("hex"),
			status: this.status,
			activities: this.activities,
			client_status: this.client_status,
			approx_last_used_time: (this.last_seen ?? new Date(0)).toISOString(),
			client_info: {
				...(this.client_info ?? {}),
				location: this.last_seen_location,
			},
			last_seen: this.last_seen,
			last_seen_ip: this.last_seen_ip,
			last_seen_location: this.last_seen_location,
			last_seen_location_info: this.last_seen_location_info,
		};
	}

	toPrivateGatewayDeviceInfo(): GatewaySession {
		// TODO: ... or has `show_current_game` privacy setting enabled - except spotify (always visible)
		const hasPrivateActivities = this.status == "offline" || this.status == "invisible";
		const inactiveTreshold = new DateBuilder(new Date(0)).addMinutes(5).buildTimestamp();

		return {
			session_id: this.session_id,
			client_info: {
				client: this.client_info?.platform ?? "",
				os: this.client_info?.os ?? "",
				version: this.client_info?.version ?? 0,
			} as GatewaySessionClientInfo,
			status: this.status,
			activities: hasPrivateActivities ? [] : this.activities,
			hidden_activities: hasPrivateActivities ? this.activities : [],
			active: TimeSpan.fromDates(this.last_seen?.getTime() ?? 0, new Date().getTime()).totalMillis < inactiveTreshold,
		};
	}

	async updateIpInfo() {
		const ipInfo = await IpDataClient.getIpInfo(this.last_seen_ip!);
		if (ipInfo?.ip) {
			this.last_seen_location = `${ipInfo.emoji_flag} ${ipInfo.postal} ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country_name}`;
			this.last_seen_location_info = {
				is_eu: ipInfo.is_eu,
				city: ipInfo.city,
				region: ipInfo.region,
				region_code: ipInfo.region_code,
				country_name: ipInfo.country_name,
				country_code: ipInfo.country_code,
				continent_name: ipInfo.continent_name,
				continent_code: ipInfo.continent_code,
				latitude: ipInfo.latitude,
				longitude: ipInfo.longitude,
				postal: ipInfo.postal,
				calling_code: ipInfo.calling_code,
				flag: ipInfo.flag,
				emoji_flag: ipInfo.emoji_flag,
				emoji_unicode: ipInfo.emoji_unicode,
			};
		}
	}
}

export interface ExtendedLocationInfo {
	is_eu: boolean;
	city: string;
	region: string;
	region_code: string;
	country_name: string;
	country_code: string;
	continent_name: string;
	continent_code: string;
	latitude: number;
	longitude: number;
	postal: string;
	calling_code: string;
	flag: string;
	emoji_flag: string;
	emoji_unicode: string;
}

export const PrivateSessionProjection: (keyof Session)[] = ["user_id", "session_id", "activities", "client_info", "status"];
