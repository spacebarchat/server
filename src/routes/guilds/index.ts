import { Router, Request, Response } from "express";
import { RoleModel, GuildModel, Snowflake, Guild, RoleDocument } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../util/instanceOf";
import { GuildCreateSchema } from "../../schema/Guild";
import * as Config from "../../util/Config";
import { getPublicUser } from "../../util/User";
import { addMember } from "../../util/Member";

const router: Router = Router();

//TODO: create default channel

router.post("/", check(GuildCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	const limitsProperties = Config.apiConfig.get('limits.user') as Config.DefaultOptions;
	const { maxGuilds } =  limitsProperties.limits.user;
	const user = await getPublicUser(req.user_id, { guilds: true });

	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError(`Maximum number of guilds reached ${maxGuilds}`, 403);
	}

	const guild_id = Snowflake.generate();
	const guild: Guild = {
		name: body.name,
		region: body.region || "en-US",
		owner_id: req.user_id,
		icon: undefined,
		afk_channel_id: undefined,
		afk_timeout: 300,
		application_id: undefined,
		banner: undefined,
		default_message_notifications: 0,
		description: undefined,
		splash: undefined,
		discovery_splash: undefined,
		explicit_content_filter: 0,
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
		system_channel_flags: 0,
		system_channel_id: undefined,
		unavailable: false,
		vanity_url: undefined,
		verification_level: 0,
		welcome_screen: {
			enabled: false,
			description: "No description",
			welcome_channels: []
		},
		widget_channel_id: undefined,
		widget_enabled: false
	};

	const [guild_doc, role] = await Promise.all([
		new GuildModel(guild).save(),
		new RoleModel({
			id: guild_id,
			guild_id: guild_id,
			color: 0,
			hoist: false,
			managed: false,
			mentionable: false,
			name: "@everyone",
			permissions: 2251804225n,
			position: 0,
			tags: null
		}).save()
	]);

	await addMember(req.user_id, guild_id, { guild: guild_doc });

	res.status(201).json({ id: guild.id });
});

export default router;
