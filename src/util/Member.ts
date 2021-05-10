import {
	Guild,
	GuildCreateEvent,
	GuildDeleteEvent,
	GuildMemberAddEvent,
	GuildMemberRemoveEvent,
	GuildMemberUpdateEvent,
	GuildModel,
	MemberModel,
	RoleModel,
	toObject,
	UserModel,
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import Config from "./Config";
import { emitEvent } from "./Event";
import { getPublicUser } from "./User";

export const PublicMemberProjection = {
	id: true,
	guild_id: true,
	nick: true,
	roles: true,
	joined_at: true,
	pending: true,
	deaf: true,
	mute: true,
	premium_since: true,
};

export async function isMember(user_id: string, guild_id: string) {
	const exists = await MemberModel.exists({ id: user_id, guild_id });
	if (!exists) throw new HTTPError("You are not a member of this guild", 403);
	return exists;
}

export async function addMember(user_id: string, guild_id: string, cache?: { guild?: Guild }) {
	const user = await getPublicUser(user_id, { guilds: true });

	const { maxGuilds } = Config.get().limits.user;
	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError(`You are at the ${maxGuilds} server limit.`, 403);
	}

	const guild = cache?.guild || (await GuildModel.findOne({ id: guild_id }).exec());
	if (!guild) throw new HTTPError("Guild not found", 404);

	if (await MemberModel.exists({ id: user.id, guild_id })) throw new HTTPError("You are already a member of this guild", 400);

	const member = {
		id: user_id,
		guild_id: guild_id,
		nick: undefined,
		roles: [guild_id], // @everyone role
		joined_at: new Date(),
		premium_since: undefined,
		deaf: false,
		mute: false,
		pending: false,
	};

	return Promise.all([
		new MemberModel({
			...member,
			settings: {
				channel_overrides: [],
				message_notifications: 0,
				mobile_push: true,
				mute_config: null,
				muted: false,
				suppress_everyone: false,
				suppress_roles: false,
				version: 0,
			},
		}).save(),

		UserModel.updateOne({ id: user_id }, { $push: { guilds: guild_id } }).exec(),
		GuildModel.updateOne({ id: guild_id }, { $inc: { member_count: 1 } }).exec(),

		emitEvent({
			event: "GUILD_MEMBER_ADD",
			data: {
				...member,
				user,
				guild_id: guild_id,
			},
			guild_id: guild_id,
		} as GuildMemberAddEvent),

		emitEvent({
			event: "GUILD_CREATE",
			data: toObject(guild),
			user_id,
		} as GuildCreateEvent),
	]);
}

export async function removeMember(user_id: string, guild_id: string) {
	const user = await getPublicUser(user_id);

	const guild = await GuildModel.findOne({ id: guild_id }, { owner_id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (guild.owner_id === user_id) throw new Error("The owner cannot be removed of the guild");
	if (!(await MemberModel.exists({ id: user.id, guild_id }))) throw new HTTPError("Is not member of this guild", 404);

	// use promise all to execute all promises at the same time -> save time
	return Promise.all([
		MemberModel.deleteOne({
			id: user_id,
			guild_id: guild_id,
		}).exec(),
		UserModel.updateOne({ id: user.id }, { $pull: { guilds: guild_id } }).exec(),
		GuildModel.updateOne({ id: guild_id }, { $inc: { member_count: -1 } }).exec(),

		emitEvent({
			event: "GUILD_DELETE",
			data: {
				id: guild_id,
			},
			user_id: user_id,
		} as GuildDeleteEvent),
		emitEvent({
			event: "GUILD_MEMBER_REMOVE",
			data: {
				guild_id: guild_id,
				user: user,
			},
			guild_id: guild_id,
		} as GuildMemberRemoveEvent),
	]);
}

export async function addRole(user_id: string, guild_id: string, role_id: string) {
	const user = await getPublicUser(user_id);

	const role = await RoleModel.findOne({ id: role_id, guild_id: guild_id }).exec();
	if (!role) throw new HTTPError("role not found", 404);

	var memberObj = await MemberModel.findOneAndUpdate(
		{
			id: user_id,
			guild_id: guild_id,
		},
		{ $push: { roles: role_id } }
	).exec();

	if (!memberObj) throw new HTTPError("Member not found", 404);

	await emitEvent({
		event: "GUILD_MEMBER_UPDATE",
		data: {
			guild_id: guild_id,
			user: user,
			roles: memberObj.roles,
		},
		guild_id: guild_id,
	} as GuildMemberUpdateEvent);
}

export async function removeRole(user_id: string, guild_id: string, role_id: string) {
	const user = await getPublicUser(user_id);

	const role = await RoleModel.findOne({ id: role_id, guild_id: guild_id }).exec();
	if (!role) throw new HTTPError("role not found", 404);

	var memberObj = await MemberModel.findOneAndUpdate(
		{
			id: user_id,
			guild_id: guild_id,
		},
		{ $pull: { roles: role_id } }
	).exec();

	if (!memberObj) throw new HTTPError("Member not found", 404);

	await emitEvent({
		event: "GUILD_MEMBER_UPDATE",
		data: {
			guild_id: guild_id,
			user: user,
			roles: memberObj.roles,
		},
		guild_id: guild_id,
	} as GuildMemberUpdateEvent);
}

export async function changeNickname(user_id: string, guild_id: string, nickname: string) {
	const user = await getPublicUser(user_id);

	var memberObj = await MemberModel.findOneAndUpdate(
		{
			id: user_id,
			guild_id: guild_id,
		},
		{ nick: nickname }
	).exec();

	if (!memberObj) throw new HTTPError("Member not found", 404);

	await emitEvent({
		event: "GUILD_MEMBER_UPDATE",
		data: {
			guild_id: guild_id,
			user: user,
			nick: nickname,
		},
		guild_id: guild_id,
	} as GuildMemberUpdateEvent);
}
