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
			id: BigInt,
			type: new Length(Number, 0, 1), // either 0 (role) or 1 (member)
			allow: BigInt,
			deny: BigInt,
		},
	],
	$parent_id: BigInt,
	$nsfw: Boolean,
};

export interface ChannelModifySchema {
	name: string;
	type: number;
	topic?: string;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: Number;
	position?: number;
	permission_overwrites?: {
		id: bigint;
		type: number;
		allow: bigint;
		deny: bigint;
	}[];
	parent_id?: bigint;
	nsfw?: boolean;
}

export const ChannelGuildPositionUpdateSchema = [
	{
		id: BigInt,
		$position: Number,
	},
];

export type ChannelGuildPositionUpdateSchema = {
	id: bigint;
	position?: number;
}[];
