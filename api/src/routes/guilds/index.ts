import { Router, Request, Response } from "express";
import { Role, Guild, Snowflake, Config, Member, Channel, DiscordApiErrors, handleFile } from "@fosscord/util";
import { route } from "@fosscord/api";
import { ChannelModifySchema } from "../channels/#channel_id";

const router: Router = Router();

export interface GuildCreateSchema {
	/**
	 * @maxLength 100
	 */
	name: string;
	region?: string;
	icon?: string | null;
	channels?: ChannelModifySchema[];
	guild_template_code?: string;
	system_channel_id?: string;
	rules_channel_id?: string;
}

//TODO: create default channel

router.post("/", route({ body: "GuildCreateSchema" }), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	const { maxGuilds } = Config.get().limits.user;
	const guild_count = await Member.count({ id: req.user_id });
	if (guild_count >= maxGuilds) {
		throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
	}

	const guild_id = Snowflake.generate();

	await new Guild({
		name: body.name,
		icon: await handleFile(`/icons/${guild_id}`, body.icon as string),
		region: Config.get().regions.default,
		owner_id: req.user_id,
		afk_timeout: 300,
		default_message_notifications: 0,
		explicit_content_filter: 0,
		features: [],
		id: guild_id,
		max_members: 250000,
		max_presences: 250000,
		max_video_channel_users: 25,
		presence_count: 0,
		member_count: 0, // will automatically be increased by addMember()
		mfa_level: 0,
		preferred_locale: "en-US",
		premium_subscription_count: 0,
		premium_tier: 0,
		system_channel_flags: 0,
		unavailable: false,
		nsfw: false,
		nsfw_level: 0,
		verification_level: 0,
		welcome_screen: {
			enabled: false,
			description: "No description",
			welcome_channels: []
		},
		widget_enabled: false
	}).save();

	// we have to create the role _after_ the guild because else we would get a "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed" error
	await new Role({
		id: guild_id,
		guild_id: guild_id,
		color: 0,
		hoist: false,
		managed: false,
		mentionable: false,
		name: "@everyone",
		permissions: String("2251804225"),
		position: 0
	}).save();

	if (!body.channels || !body.channels.length) body.channels = [{ id: "01", type: 0, name: "general" }];

	const ids = new Map();

	body.channels.forEach((x) => {
		if (x.id) {
			ids.set(x.id, Snowflake.generate());
		}
	});

	for (const channel of body.channels?.sort((a, b) => (a.parent_id ? 1 : -1))) {
		var id = ids.get(channel.id) || Snowflake.generate();

		// TODO: should we abort if parent_id is a category? (to disallow sub category channels)
		var parent_id = ids.get(channel.parent_id);

		await Channel.createChannel({ ...channel, guild_id, id, parent_id }, req.user_id, {
			keepId: true,
			skipExistsCheck: true,
			skipPermissionCheck: true,
			skipEventEmit: true
		});
	}

	await Member.addToGuild(req.user_id, guild_id);

	res.status(201).json({ id: guild_id });
});

export default router;
