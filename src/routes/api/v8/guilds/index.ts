import { Router, Request, Response } from "express";
import {
	GuildDeleteEvent,
	GuildCreateEvent,
	GuildMemberAddEvent,
	RoleModel,
	GuildModel,
	MemberModel,
	UserModel,
	Snowflake,
	getPermission,
	Guild,
} from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../../../util/instanceOf";
import { GuildCreateSchema, GuildUpdateSchema } from "../../../../schema/Guild";
import { emitEvent } from "../../../../util/Event";
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

	const perms = await getPermission(req.userid, guild_id);
	if (!perms.has("MANAGE_GUILD")) throw new HTTPError("User is missing the 'MANAGE_GUILD' permission", 401);

	const guild = await GuildModel.findOne({ id: guild_id, owner_id: req.userid }).exec();
	if (!guild) throw new HTTPError("This guild doesnt exist or you arent the owner", 404);
	await GuildModel.updateOne({ id: guild_id }, body).exec();
	return res.status(204);
});

router.post("/", check(GuildCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	// TODO: allow organization admins to bypass this
	// TODO: comprehensive organization wide permission management
	if (!Config.get().permissions.user.createGuilds) throw new HTTPError("You are not allowed to create guilds", 401);

	const user = await UserModel.findOne(
		{ id: req.userid },
		"guilds username discriminator id public_flags avatar"
	).exec();

	if (!user) throw new HTTPError("User not found", 404);

	if (user.guilds.length >= Config.get().limits.user.maxGuilds) {
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

	return res.status(204);
});

export default router;
