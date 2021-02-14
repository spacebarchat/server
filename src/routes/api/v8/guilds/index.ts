import { Router, Request, Response } from "express";
import { GuildDeleteEvent, GuildModel, MemberModel, Snowflake } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { check } from "./../../../../util/instanceOf";
import { GuildCreateSchema, GuildUpdateSchema } from "../../../../schema/Guild";
import { emitEvent } from "../../../../util/Event";

const router: Router = Router();

router.get("/:id", async (req: Request, res: Response) => {
	const guild = await GuildModel.findOne({ id: BigInt(req.params.id) }).exec();
	if (!guild) throw new HTTPError("Guild doesn't exist");

	const member = await MemberModel.findOne({ guild_id: req.params.id, id: req.userid }, "id").exec();

	if (!member) throw new HTTPError("you arent a member of the guild you are trying to access", 401);

	return res.json(guild);
});

router.patch("/:id", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	// TODO: check permission of member
	const body = req.body as GuildUpdateSchema;

	const guild = await GuildModel.findOne({ id: BigInt(req.params.id) }).exec();
	if (!guild) throw new HTTPError("This guild doesnt exist", 404);

	throw "not finished";
});

// // TODO: finish POST route
router.post("/", check(GuildCreateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;
	// TODO: check if user is in more than 100 (config max guilds)

	const guildID = Snowflake.generate();
	const guild = {
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
		// TODO: insert default everyone role
		// TODO: automatically add user to guild
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
