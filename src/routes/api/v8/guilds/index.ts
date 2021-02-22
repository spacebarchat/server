import { Router, Request, Response } from "express";
import {
	GuildDeleteEvent,
	RoleModel,
	GuildModel,
	MemberModel,
	Snowflake,
	getPermission,
	Guild,
} from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../../../util/instanceOf";
import { GuildCreateSchema, GuildUpdateSchema } from "../../../../schema/Guild";
import { emitEvent } from "../../../../util/Event";
import Config from "../../../../util/Config";
import { getPublicUser } from "../../../../util/User";
import { addMember } from "../../../../util/Member";

const router: Router = Router();

router.get("/:id", async (req: Request, res: Response) => {
	const guild_id = BigInt(req.params.id);

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild does not exist");

	const member = await MemberModel.findOne({ guild_id: guild_id, id: req.userid }, "id").exec();
	if (!member) throw new HTTPError("You are not a member of the guild you are trying to access", 401);

	return res.json(guild);
});

router.patch("/:id", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildUpdateSchema;
	const guild_id = BigInt(req.params.id);

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("This guild does not exist", 404);

	const perms = await getPermission(req.userid, guild_id);
	if (!perms.has("MANAGE_GUILD")) throw new HTTPError("You do not have the MANAGE_GUILD permission", 401);

	await GuildModel.updateOne({ id: guild_id }, body).exec();
	return res.status(204);
});

router.post("/", check(GuildCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	const { maxGuilds } = Config.get().limits.user;
	const user = await getPublicUser(req.userid, { guilds: true });

	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError(`Maximum number of guilds reached ${maxGuilds}`, 403);
	}

	const guild_id = Snowflake.generate();
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
		id: guild_id,
		large: undefined,
		max_members: 250000,
		max_presences: 250000,
		max_video_channel_users: 25,
		presence_count: 0,
		member_count: 0, // will automatically be increased by addMember()
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

	await Promise.all([
		await new GuildModel(guild).save(),
		await new RoleModel({
			id: guild_id,
			guild_id: guild_id,
			color: 0,
			hoist: false,
			managed: true,
			mentionable: true,
			name: "@everyone",
			permissions: 2251804225n,
			position: 0,
			tags: null,
		}).save(),
	]);
	await addMember(req.userid, guild_id, { guild });

	res.status(201).json({ id: guild.id });
});

router.delete("/:id", async (req: Request, res: Response) => {
	var guild_id = BigInt(req.params.id);

	const guild = await GuildModel.findOne({ id: BigInt(req.params.id) }, "owner_id").exec();
	if (!guild) throw new HTTPError("This guild does not exist", 404);
	if (guild.owner_id !== req.userid) throw new HTTPError("You are not the owner of this guild", 401);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guild_id,
		},
		guild_id: guild_id,
	} as GuildDeleteEvent);

	await GuildModel.deleteOne({ id: guild_id }).exec();

	return res.status(204).send();
});

// TODO: needs pagination/only send over websocket
router.get("/:id/members", async (req: Request, res: Response) => {
	const guild = await GuildModel.findOne({ id: BigInt(req.params.id) }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	var members = await MemberModel.find({ guild_id: BigInt(req.params.id) }).exec();
	return res.json(members);
});

export default router;
