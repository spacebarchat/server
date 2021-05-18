// @ts-nocheck WIP
import { db, getPermission, MemberModel, MongooseCache, PublicUserProjection, RoleModel } from "@fosscord/server-util";
import { LazyRequest } from "../schema/LazyRequest";
import { OPCODES, Payload } from "../util/Constants";
import { Send } from "../util/Send";
import WebSocket from "../util/WebSocket";
import { check } from "./instanceOf";

// TODO: config: if want to list all members (even those who are offline) sorted by role, or just those who are online

export async function onLazyRequest(this: WebSocket, { d }: Payload) {
	return; // WIP
	// TODO: check data
	check.call(this, LazyRequest, d);
	const { guild_id, typing, channels, activities } = d as LazyRequest;

	const permissions = await getPermission(this.user_id, guild_id);

	// MongoDB query to retrieve all hoisted roles and join them with the members and users collection
	const roles = await db
		.collection("roles")
		.aggregate([
			{ $match: { guild_id, hoist: true } },
			{ $sort: { position: 1 } },
			{
				$lookup: {
					from: "members",
					let: { id: "$id" },
					pipeline: [
						{ $match: { $expr: { $in: ["$$id", "$roles"] } } },
						{ $limit: 1 },
						{
							$lookup: {
								from: "users",
								let: { user_id: "$id" },
								pipeline: [
									{ $match: { $expr: { $eq: ["$id", "$$user_id"] } } },
									{ $project: PublicUserProjection },
								],
								as: "user",
							},
						},
					],
					as: "members",
				},
			},
		])
		.toArray();

	Send(this, {
		op: OPCODES.Dispatch,
		s: this.sequence++,
		t: "GUILD_MEMBER_LIST_UPDATE",
		d: {
			ops: [
				{
					range: [0, 99],
					op: "SYNC",
					items: [{ group: { id: "online", count: 0 } }],
				},
			],
			online_count: 1,
			member_count: 1,
			id: "everyone",
			guild_id,
			groups: [{ id: "online", count: 1 }],
		},
	});
}
