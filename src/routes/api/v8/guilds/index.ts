import { Router, Request, Response } from "express";
import { db, Guild, Snowflake } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../../../util/instanceOf";
import { GuildCreateSchema, GuildGetSchema, GuildUpdateSchema } from "../../../../schema/Guild";

const router: Router = Router();

router.get("/:id", async (req: Request, res: Response) => {
	const member = await db.data.guilds({ id: req.params.id }).members({ id: req.userid }).get({ id: true });

	if (!member) {
		throw new HTTPError("you arent a member of the guild you are trying to access", 401);
	}

	const guild = await db.data.guilds({ id: req.params.id }).get(GuildGetSchema);
	return res.json(guild);
});

router.patch("/:id", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	// TODO: check permission of member
	const body = req.body as GuildUpdateSchema;

	const guild = await db.data.guilds({ id: req.params.id }).get({ id: true });
	if (!guild) throw new HTTPError("This guild doesnt exist", 404);

	throw "not finished";
});

// // TODO: finish POST route
router.post("/", check(GuildCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	const guildID = Snowflake.generate();
	const guild: Guild = {
		// name: undefined,
		// owner: undefined,
		...body, // ! contains name & icon values
		owner_id: req.userid,
		afk_channel_id: undefined,
		afk_timeout: 300,
		application_id: undefined,
		banner: undefined,
		channels: [],
		default_message_notifications: undefined,
		description: undefined,
		splash: undefined,
		discovery_splash: undefined,
		emojis: [],
		explicit_content_filter: undefined,
		features: [],
		// icon: undefined,
		id: guildID,
		// joined_at: undefined,
		large: undefined,
		max_members: 250000,
		max_presences: undefined,
		max_video_channel_users: 25,
		member_count: 0,
		presence_count: 0,
		members: [
			{
				id: req.userid,
				roles: [], // @everyone role is not explicitly set, the client and server automatically assumes it
				joined_at: Date.now(),
				nick: undefined,
				premium_since: undefined,
				deaf: false,
				mute: false,
				pending: false,
				permissions: 8n, // value will be computed if a role is changed
			},
		],
		mfa_level: 0,
		preferred_locale: "en-US",
		premium_subscription_count: 0,
		premium_tier: 0,
		presences: [],
		public_updates_channel_id: undefined,
		region: undefined,
		roles: [
			{
				color: 0,
				hoist: false,
				name: "@everyone",
				permissions: 0n,
				id: guildID,
				managed: true, // ? discord set this to true,
				mentionable: false,
				position: 0,
			},
		],
		rules_channel_id: undefined,
		system_channel_flags: undefined,
		system_channel_id: undefined,
		unavailable: undefined,
		vanity_url_code: undefined,
		verification_level: undefined,
		voice_states: [],
		welcome_screen: [],
		widget_channel_id: undefined,
		widget_enabled: false,
	};

	try {
		await db.data.guilds.push(guild);
	} catch (error) {
		throw new HTTPError("Couldnt create Guild", 500);
	}
	res.status(201).json({ id: guild.id });
});

router.delete("/:id", async (req: Request, res: Response) => {
	const { id: guildID } = req.params;

	const guild = await db.data.guilds({ id: guildID }).get({ owner_id: true });

	if (!guild) throw new HTTPError("This guild doesnt exist", 404);
	if (guild.owner_id !== req.userid) throw new HTTPError("You arent the owner of this guild", 401);

	await db.data.guilds({ id: guildID }).delete();

	return res.status(204);
});

export default router;
