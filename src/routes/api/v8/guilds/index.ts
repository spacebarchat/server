import { Router, Request, Response } from "express";
import {
	GuildDeleteEvent,
	GuildCreateEvent,
	GuildMemberAddEvent,
	GuildMemberRemoveEvent,
	RoleModel,
	GuildModel,
	MemberModel,
	UserModel,
	Snowflake,
	getPermission,
	Guild,
	Member,
	PublicMember,
	BanModel,
	Ban,
	GuildBanAddEvent,
	GuildBanRemoveEvent,
} from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../../../util/instanceOf";
import { GuildCreateSchema, GuildUpdateSchema } from "../../../../schema/Guild";
import { BanCreateSchema } from "../../../../schema/Ban";
import { emitEvent } from "../../../../util/Event";
import { getIpAdress } from "../../../../middlewares/GlobalRateLimit";
import Config from "../../../../util/Config";

const router: Router = Router();

router.get("/:id", async (req: Request, res: Response) => {
	const guild_id = BigInt(req.params.id);
	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild doesn't exist");

	const member = await MemberModel.findOne({ guild_id: guild_id, id: req.userid }, "id").exec();

	if (!member) throw new HTTPError("you arent a member of the guild you are trying to access", 401);

	return res.json(guild);
});

router.patch("/:id", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildUpdateSchema;
	const guild_id = BigInt(req.params.id);

	// // TODO: check permission of member
	const perms = await getPermission(req.userid, guild_id);
	if (!perms.has("MANAGE_GUILD")) throw new HTTPError("User is missing the 'MANAGE_GUILD' permission", 401);

	const guild = await GuildModel.findOne({ id: guild_id, owner_id: req.userid }).exec();
	if (!guild) throw new HTTPError("This guild doesnt exist or you arent the owner", 404);
	await GuildModel.updateOne({ id: guild_id }, body).exec();
	return res.status(204);
});

// // TODO: finish POST route
router.post("/", check(GuildCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	// // TODO: check if user is in more than (config max guilds)
	const { maxGuilds } = Config.get().limits.user;
	const user = await UserModel.findOne(
		{ id: req.userid },
		"guilds username discriminator id public_flags avatar"
	).exec();

	if (!user) throw new HTTPError("User not found", 404);

	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError("User is already in 100 guilds", 403);
	}

	const guildID = Snowflake.generate();
	const guild: Guild = {
		name: body.name,
		region: body.region || "en-US",
		owner_id: req.userid,
		icon: undefined,
		afk_channel_id: undefined,
		afk_timeout: 300,
		application_id: undefined,
		banner: undefined,
		default_message_notifications: undefined,
		description: undefined,
		splash: undefined,
		discovery_splash: undefined,
		explicit_content_filter: undefined,
		features: [],
		id: guildID,
		large: undefined,
		max_members: 250000,
		max_presences: 250000,
		max_video_channel_users: 25,
		presence_count: 0,
		member_count: 1, // TODO: if a addMemberToGuild() function will be used in the future, set this to 0 and automatically increment this number
		mfa_level: 0,
		preferred_locale: "en-US",
		premium_subscription_count: 0,
		premium_tier: 0,
		public_updates_channel_id: undefined,
		rules_channel_id: undefined,
		system_channel_flags: undefined,
		system_channel_id: undefined,
		unavailable: false,
		vanity_url_code: undefined,
		verification_level: undefined,
		welcome_screen: [],
		widget_channel_id: undefined,
		widget_enabled: false,
	};

	try {
		await new GuildModel(guild).save();
		// // TODO: insert default everyone role
		await new RoleModel({
			id: guildID,
			guild_id: guildID,
			color: 0,
			hoist: false,
			managed: true,
			mentionable: true,
			name: "@everyone",
			permissions: 2251804225,
			position: 0,
			tags: null,
		}).save();

		// // TODO: automatically add user to guild
		const member = {
			id: req.userid,
			guild_id: guildID,
			nick: undefined,
			roles: [guildID],
			joined_at: Date.now(),
			premium_since: undefined,
			deaf: false,
			mute: false,
			pending: false,
			permissions: 8n,
		};

		await new MemberModel({
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
		}).save();

		// TODO: I don't know why the bigint needs to be converted to a string in order to save the model.
		// But the weird thing is, that it gets saved as a Long/bigint in the database
		// @ts-ignore
		user.guilds.push(guildID.toString());
		await user.save();

		// // TODO: emit Event
		await emitEvent({
			event: "GUILD_MEMBER_ADD",
			data: {
				...member,
				user: {
					username: user.username,
					discriminator: user.discriminator,
					id: user.id,
					publicFlags: user.public_flags,
					avatar: user.avatar,
				},
				guild_id: guildID,
			},
			guild_id: guildID,
		} as GuildMemberAddEvent);

		await emitEvent({
			event: "GUILD_CREATE",
			data: guild,
			guild_id: guildID,
		} as GuildCreateEvent);

		res.status(201).json({ id: guild.id });
	} catch (error) {
		throw new HTTPError("Couldnt create Guild", 500);
	}
});

router.delete("/:id", async (req: Request, res: Response) => {
	try {
		var guildID = BigInt(req.params.id);
	} catch (error) {
		throw new HTTPError("Invalid id format", 400);
	}

	const guild = await GuildModel.findOne({ id: BigInt(req.params.id) }, "owner_id").exec();
	if (!guild) throw new HTTPError("This guild doesnt exist", 404);
	if (guild.owner_id !== req.userid) throw new HTTPError("You arent the owner of this guild", 401);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guildID,
		},
		guild_id: guildID,
	} as GuildDeleteEvent);

	await GuildModel.deleteOne({ id: guildID }).exec();

	return res.status(204).send();
});

router.get("/:id/bans", async (req: Request, res: Response) => {
	var bans = await BanModel.find({ guild_id: BigInt(req.params.id) }).exec();
	return res.json(bans);
});

router.post("/:id/bans/:userid", check(BanCreateSchema), async (req: Request, res: Response) => {
	try {
		var guildID = BigInt(req.params.id);
		var bannedUserID = BigInt(req.params.userid);
	} catch (error) {
		throw new HTTPError("Invalid id format", 400);
	}
	const user = await UserModel.findOne(
		{ id: bannedUserID },
		"guilds username discriminator id public_flags avatar"
	).exec();

	if (!user) throw new HTTPError("User not found", 404);

	const guild = await GuildModel.findOne({ id: guildID }).exec();

	if (!guild) throw new HTTPError("Guild not found", 404);

	const member = await MemberModel.findOne(
		{
			id: BigInt(user.id),
			guild_id: guild.id,
		},
		"id"
	).exec();

	if (!member) throw new HTTPError("Member not found", 404);
	/*const perms = await getPermission(req.userid, guild.id);
	if (!perms.has("BAN_MEMBERS")) {
		throw new HTTPError("No permissions", 403);
	}*/

	if (req.userid === user.id) throw new HTTPError("Invalid Request, you can't ban yourself", 400);
	if (user.id === guild.owner_id) throw new HTTPError("Invalid Request, you can't ban the guild owner", 400);

	var ban = await new BanModel({
		user_id: BigInt(user.id),
		guild_id: guild.id,
		ip: getIpAdress(req),
		executor_id: req.userid,
		reason: req.body.reason || "No Reason",
	}).save();

	await MemberModel.deleteOne({
		id: BigInt(user.id),
		guild_id: guild.id,
	}).exec();
	await UserModel.findOneAndUpdate({ id: user.id }, { $pull: { guilds: guild.id } }).exec();

	await emitEvent({
		event: "GUILD_BAN_ADD",
		data: {
			guild_id: guild.id,
			user: user,
		},
		guild_id: guild.id,
	} as GuildBanAddEvent);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guild.id,
		},
		user_id: user.id,
	} as GuildDeleteEvent);

	await emitEvent({
		event: "GUILD_MEMBER_REMOVE",
		data: {
			guild_id: guild.id,
			user: user,
		},
		guild_id: guild.id,
	} as GuildMemberRemoveEvent);

	return res.json(ban).send();
});

router.delete("/:id/bans/:userid", async (req: Request, res: Response) => {
	try {
		var guildID = BigInt(req.params.id);
		var bannedUserID = BigInt(req.params.userid);
	} catch (error) {
		throw new HTTPError("Invalid id format", 400);
	}
	const user = await UserModel.findOne(
		{ id: bannedUserID },
		"guilds username discriminator id public_flags avatar"
	).exec();

	if (!user) throw new HTTPError("User not found", 404);

	const guild = await GuildModel.findOne({ id: guildID }).exec();

	if (!guild) throw new HTTPError("Guild not found", 404);
	/*const perms = await getPermission(req.userid, guild.id);
	if (!perms.has("BAN_MEMBERS")) {
		throw new HTTPError("No permissions", 403);
	}*/

	await BanModel.deleteOne({
		user_id: BigInt(user.id),
		guild_id: guild.id,
	}).exec();

	await emitEvent({
		event: "GUILD_BAN_REMOVE",
		data: {
			guild_id: guild.id,
			user: user,
		},
		guild_id: guild.id,
	} as GuildBanRemoveEvent);

	return res.status(204).send();
});

export default router;
