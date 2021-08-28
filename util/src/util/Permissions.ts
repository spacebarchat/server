// https://github.com/discordjs/discord.js/blob/master/src/util/Permissions.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
import { In } from "typeorm";
import { Channel, ChannelPermissionOverwrite, Guild, Member, Role } from "../entities";
import { BitField } from "./BitField";
// TODO: check role hierarchy permission

var HTTPError: any;

try {
	HTTPError = require("lambert-server").HTTPError;
} catch (e) {
	HTTPError = Error;
}

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
	| "MANAGE_EMOJIS_AND_STICKERS";

const CUSTOM_PERMISSION_OFFSET = BigInt(1) << BigInt(48); // 16 free custom permission bits, and 16 for discord to add new ones

export class Permissions extends BitField {
	cache: PermissionCache = {};

	static FLAGS = {
		CREATE_INSTANT_INVITE: BigInt(1) << BigInt(0),
		KICK_MEMBERS: BigInt(1) << BigInt(1),
		BAN_MEMBERS: BigInt(1) << BigInt(2),
		ADMINISTRATOR: BigInt(1) << BigInt(3),
		MANAGE_CHANNELS: BigInt(1) << BigInt(4),
		MANAGE_GUILD: BigInt(1) << BigInt(5),
		ADD_REACTIONS: BigInt(1) << BigInt(6),
		VIEW_AUDIT_LOG: BigInt(1) << BigInt(7),
		PRIORITY_SPEAKER: BigInt(1) << BigInt(8),
		STREAM: BigInt(1) << BigInt(9),
		VIEW_CHANNEL: BigInt(1) << BigInt(10),
		SEND_MESSAGES: BigInt(1) << BigInt(11),
		SEND_TTS_MESSAGES: BigInt(1) << BigInt(12),
		MANAGE_MESSAGES: BigInt(1) << BigInt(13),
		EMBED_LINKS: BigInt(1) << BigInt(14),
		ATTACH_FILES: BigInt(1) << BigInt(15),
		READ_MESSAGE_HISTORY: BigInt(1) << BigInt(16),
		MENTION_EVERYONE: BigInt(1) << BigInt(17),
		USE_EXTERNAL_EMOJIS: BigInt(1) << BigInt(18),
		VIEW_GUILD_INSIGHTS: BigInt(1) << BigInt(19),
		CONNECT: BigInt(1) << BigInt(20),
		SPEAK: BigInt(1) << BigInt(21),
		MUTE_MEMBERS: BigInt(1) << BigInt(22),
		DEAFEN_MEMBERS: BigInt(1) << BigInt(23),
		MOVE_MEMBERS: BigInt(1) << BigInt(24),
		USE_VAD: BigInt(1) << BigInt(25),
		CHANGE_NICKNAME: BigInt(1) << BigInt(26),
		MANAGE_NICKNAMES: BigInt(1) << BigInt(27),
		MANAGE_ROLES: BigInt(1) << BigInt(28),
		MANAGE_WEBHOOKS: BigInt(1) << BigInt(29),
		MANAGE_EMOJIS_AND_STICKERS: BigInt(1) << BigInt(30),
		/**
		 * CUSTOM PERMISSIONS ideas:
		 * - allow user to dm members
		 * - allow user to pin messages (without MANAGE_MESSAGES)
		 * - allow user to publish messages (without MANAGE_MESSAGES)
		 */
		// CUSTOM_PERMISSION: BigInt(1) << BigInt(0) + CUSTOM_PERMISSION_OFFSET
	};

	any(permission: PermissionResolvable, checkAdmin = true) {
		return (checkAdmin && super.any(Permissions.FLAGS.ADMINISTRATOR)) || super.any(permission);
	}

	/**
	 * Checks whether the bitfield has a permission, or multiple permissions.
	 */
	has(permission: PermissionResolvable, checkAdmin = true) {
		return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.has(permission);
	}

	/**
	 * Checks whether the bitfield has a permission, or multiple permissions, but throws an Error if user fails to match auth criteria.
	 */
	hasThrow(permission: PermissionResolvable) {
		if (this.has(permission) && this.has("VIEW_CHANNEL")) return true;
		// @ts-ignore
		throw new HTTPError(`You are missing the following permissions ${permission}`, 403);
	}

	overwriteChannel(overwrites: ChannelPermissionOverwrite[]) {
		if (!this.cache) throw new Error("permission chache not available");
		overwrites = overwrites.filter((x) => {
			if (x.type === 0 && this.cache.roles?.some((r) => r.id === x.id)) return true;
			if (x.type === 1 && x.id == this.cache.user_id) return true;
			return false;
		});
		return new Permissions(Permissions.channelPermission(overwrites, this.bitfield));
	}

	static channelPermission(overwrites: ChannelPermissionOverwrite[], init?: bigint) {
		// TODO: do not deny any permissions if admin
		return overwrites.reduce((permission, overwrite) => {
			// apply disallowed permission
			// * permission: current calculated permission (e.g. 010)
			// * deny contains all denied permissions (e.g. 011)
			// * allow contains all explicitly allowed permisions (e.g. 100)
			return (permission & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow);
			// ~ operator inverts deny (e.g. 011 -> 100)
			// & operator only allows 1 for both ~deny and permission (e.g. 010 & 100 -> 000)
			// | operators adds both together (e.g. 000 + 100 -> 100)
		}, init || BigInt(0));
	}

	static rolePermission(roles: Role[]) {
		// adds all permissions of all roles together (Bit OR)
		return roles.reduce((permission, role) => permission | BigInt(role.permissions), BigInt(0));
	}

	static finalPermission({
		user,
		guild,
		channel,
	}: {
		user: { id: string; roles: string[] };
		guild: { roles: Role[] };
		channel?: {
			overwrites?: ChannelPermissionOverwrite[];
			recipient_ids?: string[] | null;
			owner_id?: string;
		};
	}) {
		if (user.id === "0") return new Permissions("ADMINISTRATOR"); // system user id

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

		if (channel?.recipient_ids) {
			if (channel?.owner_id === user.id) return new Permissions("ADMINISTRATOR");
			if (channel.recipient_ids.includes(user.id)) {
				// Default dm permissions
				return new Permissions([
					"VIEW_CHANNEL",
					"SEND_MESSAGES",
					"STREAM",
					"ADD_REACTIONS",
					"EMBED_LINKS",
					"ATTACH_FILES",
					"READ_MESSAGE_HISTORY",
					"MENTION_EVERYONE",
					"USE_EXTERNAL_EMOJIS",
					"CONNECT",
					"SPEAK",
					"MANAGE_CHANNELS",
				]);
			}

			return new Permissions();
		}

		return new Permissions(permission);
	}
}

export type PermissionCache = {
	channel?: Channel | undefined;
	member?: Member | undefined;
	guild?: Guild | undefined;
	roles?: Role[] | undefined;
	user_id?: string;
};

export async function getPermission(user_id?: string, guild_id?: string, channel_id?: string) {
	if (!user_id) throw new HTTPError("User not found");
	var channel: Channel | undefined;
	var member: Member | undefined;
	var guild: Guild | undefined;

	if (channel_id) {
		channel = await Channel.findOneOrFail(
			{ id: channel_id },
			{ select: ["permission_overwrites", "recipients", "owner", "guild"] }
		);
		if (channel.guild_id) guild_id = channel.guild_id; // derive guild_id from the channel
	}

	if (guild_id) {
		guild = await Guild.findOneOrFail({ id: guild_id }, { select: ["owner"] });
		if (guild.owner_id === user_id) return new Permissions(Permissions.FLAGS.ADMINISTRATOR);

		member = await Member.findOneOrFail({ guild_id, id: user_id }, { select: ["roles"] });
	}

	var permission = Permissions.finalPermission({
		user: {
			id: user_id,
			roles: member?.role_ids || [],
		},
		guild: {
			roles: member?.roles || [],
		},
		channel: {
			overwrites: channel?.permission_overwrites,
			owner_id: channel?.owner_id,
			recipient_ids: channel?.recipient_ids,
		},
	});

	const obj = new Permissions(permission);

	// pass cache to permission for possible future getPermission calls
	obj.cache = { guild, member, channel, roles: member?.roles, user_id };

	return obj;
}
