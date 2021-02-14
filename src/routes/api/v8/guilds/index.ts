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
	const user = await UserModel.findOne({ id: req.userid }, "guilds").exec();

	if (!user) throw new HTTPError("User not found", 404);

	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError("User is already in 100 guilds", 403);
	}

	const guildID = Snowflake.generate();
	const guild: any = {
		// TODO:
		// ! temp fix [Type: any] for:
		// ! Conversion of type '{ event: "GUILD_CREATE"; data: { guild_id: bigint; name: string; region: string; owner_id: any; icon: undefined; afk_channel_id: undefined; afk_timeout: number; application_id: undefined; banner: undefined; ... 27 more ...; widget_enabled: boolean; }; guild_id: bigint; }' to type 'GuildCreateEvent' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.Type '{ event: "GUILD_CREATE"; data: { guild_id: bigint; name: string; region: string; owner_id: any; icon: undefined; afk_channel_id: undefined; afk_timeout: number; application_id: undefined; banner: undefined; ... 27 more ...; widget_enabled: boolean; }; guild_id: bigint; }' is missing the following properties from type 'GuildCreateEvent': $ignore, $isDefault, $isDeleted, $isEmpty, and 44 more.ts(2352)

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
		member_count: 0,
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
		voice_states: [],
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
		const member: any = {
			// TODO:
			// ! temp fix [Type: any] for:
			// ! Conversion of type '{ event: "GUILD_MEMBER_ADD"; data: { guild_id: bigint; id: any; nick: null; roles: bigint[]; joined_at: number; premium_since: null; deaf: boolean; mute: boolean; pending: boolean; permissions: number; }; guild_id: bigint; }' to type 'GuildMemberAddEvent' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.Type '{ event: "GUILD_MEMBER_ADD"; data: { guild_id: bigint; id: any; nick: null; roles: bigint[]; joined_at: number; premium_since: null; deaf: boolean; mute: boolean; pending: boolean; permissions: number; }; guild_id: bigint; }' is missing the following properties from type 'GuildMemberAddEvent': $ignore, $isDefault, $isDeleted, $isEmpty, and 44 more.ts(2352)

			id: req.userid,
			guild_id: guildID,
			nick: null,
			roles: [guildID],
			joined_at: Date.now(),
			premium_since: null,
			deaf: false,
			mute: false,
			pending: false,
			permissions: 8,
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

		// // TODO: emit Event
		await emitEvent({
			event: "GUILD_MEMBER_ADD",
			data: {
				...member,
				guild_id: guildID,
			},
			guild_id: guildID,
		} as GuildMemberAddEvent);
		await emitEvent({
			event: "GUILD_CREATE",
			data: {
				...guild,
				guild_id: guildID,
			},
			guild_id: guildID,
		} as GuildCreateEvent);
	} catch (error) {
		throw new HTTPError("Couldnt create Guild", 500);
	}
	res.status(201).json({ id: guild.id });
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

export async function addMember(guild: bigint, user: bigint) {}
