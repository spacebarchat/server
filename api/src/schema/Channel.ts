import { ChannelType } from "@fosscord/util";
import { Length } from "../util/instanceOf";

export const ChannelModifySchema = {
	name: new Length(String, 2, 100),
	type: new Length(Number, 0, 13),
	$topic: new Length(String, 0, 1024),
	$bitrate: Number,
	$user_limit: Number,
	$rate_limit_per_user: new Length(Number, 0, 21600),
	$position: Number,
	$permission_overwrites: [
		{
			id: String,
			type: new Length(Number, 0, 1), // either 0 (role) or 1 (member)
			allow: BigInt,
			deny: BigInt
		}
	],
	$parent_id: String,
	$rtc_region: String,
	$default_auto_archive_duration: Number,
	$id: String, // kept for backwards compatibility does nothing (need for guild create)
	$nsfw: Boolean
};

export const DmChannelCreateSchema = {
	$name: String,
	recipients: new Length([String], 1, 10)
};

export interface DmChannelCreateSchema {
	name?: string;
	recipients: string[];
}

export interface ChannelModifySchema {
	name: string;
	type: number;
	topic?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: {
		id: string;
		type: number;
		allow: bigint;
		deny: bigint;
	}[];
	parent_id?: string;
	id?: string; // is not used (only for guild create)
	nsfw?: boolean;
	rtc_region?: string;
	default_auto_archive_duration?: number;
}

export const ChannelGuildPositionUpdateSchema = [
	{
		id: String,
		$position: Number
	}
];

export type ChannelGuildPositionUpdateSchema = {
	id: string;
	position?: number;
}[];
