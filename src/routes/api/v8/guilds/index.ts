import { Router, Request, Response } from "express";
import { db, GuildSchema, Guild } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../../../util/instanceOf";

const router: Router = Router();

router.get("/:id", async (req: Request, res: Response) => {
	const member = await db.data.guilds({ id: req.params.id }).members({ id: req.userid }).get({ id: true });

	if (!member) {
		throw new HTTPError("you arent a member of the guild you are trying to access", 401);
	}

	const guild = await db.data.guilds({ id: req.params.id }).get({
		id: true,
		name: true,
		icon: true,
		// icon_hash: true,
		splash: true,
		discovery_splash: true,
		owner: true,
		owner_id: true,
		permissions: true,
		region: true,
		afk_channel_id: true,
		afk_timeout: true,
		widget_enabled: true,
		widget_channel_id: true,
		verification_level: true,
		default_message_notifications: true,
		explicit_content_filter: true,
		roles: true,
		emojis: true,
		features: true,
		mfa_level: true,
		application_id: true,
		system_channel_id: true,
		system_channel_flags: true,
		rules_channel_id: true,
		joined_at: true,
		// large: true,
		// unavailable: true,
		member_count: true,
		// voice_states: true,
		// members: true,
		// channels: true,
		// presences: true,
		max_presences: true,
		max_members: true,
		vanity_url_code: true,
		description: true,
		banner: true,
		premium_tier: true,
		premium_subscription_count: true,
		preferred_locale: true,
		public_updates_channel_id: true,
		max_video_channel_users: true,
		approximate_member_count: true,
		approximate_presence_count: true,
		// welcome_screen: true,
	});
	return res.json(guild);
});

// router.put("/:id", check(GuildSchema), async (req: Request, res: Response) => {}); // TODO: add addGuildSchema & createGuildSchema

// TODO: finish POST route
// router.post("/", check(GuildSchema), async (req: Request, res: Response) => {
// 	const body = req.body as GuildSchema;
// 	const guildID = BigInt();
// 	const guild: Guild = {
// 		...body, // ! contains name & icon values
// 		afk_channel_id: undefined,
// 		afk_timeout: undefined,
// 		application_id: undefined,
// 		approximate_member_count: undefined,
// 		approximate_presence_count: undefined,
// 		banner: undefined,
// 		channels: [],
// 		default_message_notifications: undefined,
// 		description: undefined,
// 		discovery_splash: undefined,
// 		emojis: [],
// 		explicit_content_filter: undefined,
// 		features: [],
// 		// icon: undefined,
// 		id: guildID,
// 		// joined_at: undefined,
// 		large: undefined,
// 		max_members: undefined,
// 		max_presences: undefined,
// 		max_video_channel_users: undefined,
// 		member_count: undefined,
// 		members: undefined,
// 		mfa_level: undefined,
// 		// name: undefined,
// 		owner_id: req.userid, // ! important
// 		// owner: undefined,
// 		permissions: undefined,
// 		preferred_locale: undefined,
// 		premium_subscription_count: undefined,
// 		premium_tier: undefined,
// 		presences: [],
// 		public_updates_channel_id: undefined,
// 		region: undefined,
// 		roles: [],
// 		rules_channel_id: undefined,
// 		splash: undefined,
// 		system_channel_flags: undefined,
// 		system_channel_id: undefined,
// 		unavailable: undefined,
// 		vanity_url_code: undefined,
// 		verification_level: undefined,
// 		voice_states: [],
// 		welcome_screen: [],
// 		widget_channel_id: undefined,
// 		widget_enabled: undefined,
// 	};

// 	try {
// 		await db.data.guilds.push(guild);
// 	} catch (error) {
// 		throw new HTTPError("Couldnt create Guild", 500);
// 	}
// 	res.status(201).json({ id: guild.id });
// });

router.delete("/:id", async (req: Request, res: Response) => {
	const { id: guildID } = req.params;

	const guild = await db.data.guilds({ id: guildID }).get({ owner_id: true });

	if (!guild) {
		throw new HTTPError("This guild doesnt exist", 404);
	}

	if (guild.owner_id !== req.userid) {
		throw new HTTPError("You arent the owner of this guild", 401);
	}

	try {
		await db.data.guilds({ id: guildID }).delete();
	} catch (error) {
		throw new HTTPError(`Couldnt delete guild: ${error}`, 500);
	}

	return res.status(204);
});

export default router;
