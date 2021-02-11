import { User } from "..";
import { ClientStatus, Status } from "./Status";

export interface Presence {
	user: User;
	guild_id: bigint;
	status: Status;
	activities: Activity[];
	client_status: ClientStatus;
}

export interface Activity {
	name: string;
	type: ActivityType;
	url?: string;
	created_at: number;
	timestamps?: {
		start: number;
		end: number;
	}[];
	application_id?: bigint;
	details?: string;
	state?: string;
	emoji?: {
		name: string;
		id?: bigint;
		amimated?: boolean;
	};
	party?: {
		id?: string;
		size?: [number, number];
	};
	assets?: {
		large_image: string;
		large_text: string;
		small_image: string;
		small_text: string;
	};
	secrets?: {
		join?: string;
		spectate?: string;
		match?: string;
	};
	instance?: boolean;
	flags?: bigint;
}

export enum ActivityType {
	GAME = 0,
	STREAMING = 1,
	LISTENING = 2,
	CUSTOM = 4,
	COMPETING = 5,
}
