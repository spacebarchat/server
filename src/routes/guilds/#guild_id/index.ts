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
	UserModel
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

export default router;
