import {
	getPermission,
	Member,
	PublicMemberProjection,
	Role,
} from "@fosscord/util";
import { LazyRequest } from "../schema/LazyRequest";
import { WebSocket, Send, OPCODES, Payload } from "@fosscord/gateway";
import { check } from "./instanceOf";
import "missing-native-js-functions";

// TODO: check permission and only show roles/members that have access to this channel
// TODO: config: to list all members (even those who are offline) sorted by role, or just those who are online
// TODO: rewrite typeorm

export async function onLazyRequest(this: WebSocket, { d }: Payload) {
	// TODO: check data
	check.call(this, LazyRequest, d);
	const { guild_id, typing, channels, activities } = d as LazyRequest;

	const permissions = await getPermission(this.user_id, guild_id);
	permissions.hasThrow("VIEW_CHANNEL");

	var members = await Member.find({
		where: { guild_id: guild_id },
		relations: ["roles", "user"],
		select: PublicMemberProjection,
	});

	const roles = await Role.find({
		where: { guild_id: guild_id },
		order: {
			position: "DESC",
		},
	});

	const groups = [] as any[];
	var member_count = 0;
	const items = [];

	for (const role of roles) {
		const [role_members, other_members] = partition(members, (m: Member) =>
			m.roles.find((r) => r.id === role.id)
		);
		const group = {
			count: role_members.length,
			id: role.id === guild_id ? "online" : role.id,
		};

		items.push({ group });
		groups.push(group);

		for (const member of role_members) {
			member.roles = member.roles.filter((x) => x.id !== guild_id);
			items.push({
				member: { ...member, roles: member.roles.map((x) => x.id) },
			});
		}
		members = other_members;
		member_count += role_members.length;
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
					items,
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

function partition<T>(array: T[], isValid: Function) {
	return array.reduce(
		([pass, fail], elem) => {
			return isValid(elem)
				? [[...pass, elem], fail]
				: [pass, [...fail, elem]];
		},
		[[], []]
	);
}
