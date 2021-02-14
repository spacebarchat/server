// https://github.com/discordjs/discord.js/blob/master/src/util/Permissions.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
import { MemberModel } from "../models/Member";
import { ChannelDocument, ChannelModel } from "../models/Channel";
import { ChannelPermissionOverwrite } from "../models/Channel";
import { Role, RoleModel } from "../models/Role";
import { BitField } from "./BitField";

export type PermissionResolvable = bigint | number | Permissions | PermissionResolvable[] | PermissionString;

type PermissionString =
	| "CREATE_INSTANT_INVITE"
	| "KICK_MEMBERS"
	| "BAN_MEMBERS"
	| "ADMINISTRATOR"
	| "MANAGE_CHANNELS"
	| "MANAGE_GUILD"
	| "ADD_REACTIONS"
	| "VIEW_AUDIT_LOG"
	| "PRIORITY_SPEAKER"
	| "STREAM"
	| "VIEW_CHANNEL"
	| "SEND_MESSAGES"
	| "SEND_TTS_MESSAGES"
	| "MANAGE_MESSAGES"
	| "EMBED_LINKS"
	| "ATTACH_FILES"
	| "READ_MESSAGE_HISTORY"
	| "MENTION_EVERYONE"
	| "USE_EXTERNAL_EMOJIS"
	| "VIEW_GUILD_INSIGHTS"
	| "CONNECT"
	| "SPEAK"
	| "MUTE_MEMBERS"
	| "DEAFEN_MEMBERS"
	| "MOVE_MEMBERS"
	| "USE_VAD"
	| "CHANGE_NICKNAME"
	| "MANAGE_NICKNAMES"
	| "MANAGE_ROLES"
	| "MANAGE_WEBHOOKS"
	| "MANAGE_EMOJIS";

export class Permissions extends BitField {
	static FLAGS = {
		CREATE_INSTANT_INVITE: 1n << 0n,
		KICK_MEMBERS: 1n << 1n,
		BAN_MEMBERS: 1n << 2n,
		ADMINISTRATOR: 1n << 3n,
		MANAGE_CHANNELS: 1n << 4n,
		MANAGE_GUILD: 1n << 5n,
		ADD_REACTIONS: 1n << 6n,
		VIEW_AUDIT_LOG: 1n << 7n,
		PRIORITY_SPEAKER: 1n << 8n,
		STREAM: 1n << 9n,
		VIEW_CHANNEL: 1n << 10n,
		SEND_MESSAGES: 1n << 11n,
		SEND_TTS_MESSAGES: 1n << 12n,
		MANAGE_MESSAGES: 1n << 13n,
		EMBED_LINKS: 1n << 14n,
		ATTACH_FILES: 1n << 15n,
		READ_MESSAGE_HISTORY: 1n << 16n,
		MENTION_EVERYONE: 1n << 17n,
		USE_EXTERNAL_EMOJIS: 1n << 18n,
		VIEW_GUILD_INSIGHTS: 1n << 19n,
		CONNECT: 1n << 20n,
		SPEAK: 1n << 21n,
		MUTE_MEMBERS: 1n << 22n,
		DEAFEN_MEMBERS: 1n << 23n,
		MOVE_MEMBERS: 1n << 24n,
		USE_VAD: 1n << 25n,
		CHANGE_NICKNAME: 1n << 26n,
		MANAGE_NICKNAMES: 1n << 27n,
		MANAGE_ROLES: 1n << 28n,
		MANAGE_WEBHOOKS: 1n << 29n,
		MANAGE_EMOJIS: 1n << 30n,
	};

	any(permission: PermissionResolvable, checkAdmin = true) {
		return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.any(permission);
	}

	/**
	 * Checks whether the bitfield has a permission, or multiple permissions.
	 */
	has(permission: PermissionResolvable, checkAdmin = true) {
		return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.has(permission);
	}

	static channelPermission(overwrites: ChannelPermissionOverwrite[], init?: bigint) {
		// TODO: do not deny any permissions if admin
		return overwrites.reduce((permission, overwrite) => {
			// apply disallowed permission
			// * permission: current calculated permission (e.g. 010)
			// * deny contains all denied permissions (e.g. 011)
			// * allow contains all explicitly allowed permisions (e.g. 100)
			return (permission & ~overwrite.deny) | overwrite.allow;
			// ~ operator inverts deny (e.g. 011 -> 100)
			// & operator only allows 1 for both ~deny and permission (e.g. 010 & 100 -> 000)
			// | operators adds both together (e.g. 000 + 100 -> 100)
		}, 0n ?? init);
	}

	static rolePermission(roles: Role[]) {
		// adds all permissions of all roles together (Bit OR)
		return roles.reduce((permission, role) => permission | role.permissions, 0n);
	}

	static finalPermission({
		user,
		guild,
		channel,
	}: {
		user: { id: bigint; roles: bigint[] };
		guild: { roles: Role[] };
		channel?: {
			overwrites?: ChannelPermissionOverwrite[];
		};
	}) {
		let roles = guild.roles.filter((x) => user.roles.includes(x.id));
		let permission = Permissions.rolePermission(roles);

		if (channel?.overwrites) {
			let overwrites = channel.overwrites.filter((x) => {
				if (x.type === 0 && user.roles.includes(x.id)) return true;
				if (x.type === 1 && x.id == user.id) return true;
				return false;
			});
			permission = Permissions.channelPermission(overwrites, permission);
		}

		return permission;
	}
}

export async function getPermission(user_id: bigint, guild_id: bigint, channel_id?: bigint) {
	var member = await MemberModel.findOne({ guild_id, id: user_id }, "roles").exec();
	if (!member) throw new Error("Member not found");

	var roles = await RoleModel.find({ guild_id, id: { $in: member.roles } }).exec();
	let channel: ChannelDocument | null = null;
	if (channel_id) {
		channel = await ChannelModel.findOne({ id: channel_id }, "permission_overwrites");
	}

	var permission = Permissions.finalPermission({
		user: {
			id: user_id,
			roles: member.roles,
		},
		guild: {
			roles: roles,
		},
		channel: {
			overwrites: channel?.permission_overwrites,
		},
	});

	return permission;
}
