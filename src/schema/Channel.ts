import { ChannelType } from "@fosscord/server-util";
import { Length } from "../util/instanceOf";

export const ChannelModifySchema = {
	name: new Length(String, 2, 100),
	type: Number,
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
			deny: BigInt,
		},
	],
	$parent_id: String,
	$nsfw: Boolean,
};

export const DmChannelCreateSchema = {
	$name: String,
	recipients: [String],
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
	nsfw?: boolean;
}

export const ChannelGuildPositionUpdateSchema = [
	{
		id: String,
		$position: Number,
	},
];

export type ChannelGuildPositionUpdateSchema = {
	id: string;
	position?: number;
}[];
