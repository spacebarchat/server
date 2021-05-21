// @ts-nocheck WIP
import {
	db,
	getPermission,
	MemberModel,
	MongooseCache,
	PublicUserProjection,
	RoleModel,
	toObject,
} from "@fosscord/server-util";
import { LazyRequest } from "../schema/LazyRequest";
import { OPCODES, Payload } from "../util/Constants";
import { Send } from "../util/Send";
import WebSocket from "../util/WebSocket";
import { check } from "./instanceOf";

// TODO: config: if want to list all members (even those who are offline) sorted by role, or just those who are online

export async function onLazyRequest(this: WebSocket, { d }: Payload) {
	// TODO: check data
	check.call(this, LazyRequest, d);
	const { guild_id, typing, channels, activities } = d as LazyRequest;

	const permissions = await getPermission(this.user_id, guild_id);

	// MongoDB query to retrieve all hoisted roles and join them with the members and users collection
	const roles = toObject(
		await db
			.collection("roles")
			.aggregate([
				{
					$match: {
						guild_id,
						// hoist: true // TODO: also match @everyone role
					},
				},
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
							{
								$unwind: "$user",
							},
						],
						as: "members",
					},
				},
			])
			.toArray()
	);

	const groups = roles.map((x) => ({ id: x.id === guild_id ? "online" : x.id, count: x.members.length }));
	const member_count = roles.reduce((a, b) => b.members.length + a, 0);
	const items = [];

	for (const role of roles) {
		items.push({
			group: {
				count: role.members.length,
				id: role.id,
			},
		});
		for (const member of role.members) {
			items.push({ member });
		}
	}

	return Send(this, {
		op: OPCODES.Dispatch,
		s: this.sequence++,
		t: "GUILD_MEMBER_LIST_UPDATE",
		d: {
			ops: [
				{
					range: [0, 99],
					op: "SYNC",
					items: items,
				},
			],
			online_count: member_count, // TODO count online count
			member_count,
			id: "everyone",
			guild_id,
			groups,
		},
	});
}
