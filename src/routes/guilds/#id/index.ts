import { Request, Response, Router } from "express";
import {
	ChannelModel,
	EmojiModel,
	getPermission,
	GuildDeleteEvent,
	GuildModel,
	InviteModel,
	MemberModel,
	MessageModel,
	RoleModel,
	UserModel,
} from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { GuildUpdateSchema } from "../../../schema/Guild";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const guild_id = req.params.id;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild does not exist", 404);

	const member = await MemberModel.findOne({ guild_id: guild_id, id: req.user_id }, "id").exec();
	if (!member) throw new HTTPError("You are not a member of the guild you are trying to access", 401);

	return res.json(guild);
});

router.patch("/", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildUpdateSchema;
	const guild_id = req.params.id;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("This guild does not exist", 404);

	const perms = await getPermission(req.user_id, guild_id);
	if (!perms.has("MANAGE_GUILD")) throw new HTTPError("You do not have the MANAGE_GUILD permission", 401);

	await GuildModel.updateOne({ id: guild_id }, body).exec();
	return res.status(204);
});

router.delete("/", async (req: Request, res: Response) => {
	var guild_id = req.params.id;

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

	return res.status(204).send();
});

export default router;
