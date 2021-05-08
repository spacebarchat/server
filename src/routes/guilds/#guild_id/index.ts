import { Request, Response, Router } from "express";
import {
	ChannelModel,
	EmojiModel,
	getPermission,
	GuildDeleteEvent,
	GuildModel,
	GuildUpdateEvent,
	InviteModel,
	MemberModel,
	MessageModel,
	RoleModel,
	toObject,
	UserModel,
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { GuildUpdateSchema } from "../../../schema/Guild";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import "missing-native-js-functions";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id })
		.populate({ path: "joined_at", match: { id: req.user_id } })
		.exec();
	if (!guild) throw new HTTPError("Guild does not exist", 404);

	const member = await MemberModel.exists({ guild_id: guild_id, id: req.user_id });
	if (!member) throw new HTTPError("You are not a member of the guild you are trying to access", 401);

	return res.json(guild);
});

router.patch("/", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildUpdateSchema;
	const { guild_id } = req.params;
	// TODO: guild update check image

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const guild = await GuildModel.findOneAndUpdate({ id: guild_id }, body)
		.populate({ path: "joined_at", match: { id: req.user_id } })
		.exec();

	const data = toObject(guild);

	emitEvent({ event: "GUILD_UPDATE", data: data, guild_id } as GuildUpdateEvent);

	return res.send(data);
});

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/delete", async (req: Request, res: Response) => {
	var { guild_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, "owner_id").exec();
	if (!guild) throw new HTTPError("This guild does not exist", 404);
	if (guild.owner_id !== req.user_id) throw new HTTPError("You are not the owner of this guild", 401);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guild_id,
		},
		guild_id: guild_id,
	} as GuildDeleteEvent);

	await GuildModel.deleteOne({ id: guild_id }).exec();
	await UserModel.updateMany({ guilds: guild_id }, { $pull: { guilds: guild_id } }).exec();
	await RoleModel.deleteMany({ guild_id }).exec();
	await ChannelModel.deleteMany({ guild_id }).exec();
	await EmojiModel.deleteMany({ guild_id }).exec();
	await InviteModel.deleteMany({ guild_id }).exec();
	await MessageModel.deleteMany({ guild_id }).exec();

	return res.sendStatus(204);
});

router.get("/vanity-url", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild does not exist", 404);

	if(!guild.vanity_url) throw new HTTPError("This guild has no vanity url", 204)

	return res.json(toObject(guild.vanity_url));
});

export default router;
