import { Request, Response, Router } from "express";
import {
	Channel,
	emitEvent,
	EmojiModel,
	getPermission,
	GuildDeleteEvent,
	Guild,
	GuildUpdateEvent,
	InviteModel,
	Member,
	Message,
	Role,
	toObject,
	User
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { GuildUpdateSchema } from "../../../schema/Guild";

import { check } from "../../../util/instanceOf";
import { handleFile } from "../../../util/cdn";
import "missing-native-js-functions";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ id: guild_id }).populate({ path: "joined_at", match: { id: req.user_id } });
	const member = await Member.exists({ guild_id: guild_id, id: req.user_id });
	if (!member) throw new HTTPError("You are not a member of the guild you are trying to access", 401);

	return res.json(guild);
});

router.patch("/", check(GuildUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as GuildUpdateSchema;
	const { guild_id } = req.params;
	// TODO: guild update check image

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	if (body.icon) body.icon = await handleFile(`/icons/${guild_id}`, body.icon);
	if (body.banner) body.banner = await handleFile(`/banners/${guild_id}`, body.banner);
	if (body.splash) body.splash = await handleFile(`/splashes/${guild_id}`, body.splash);

	const guild = await Guild.findOneOrFailAndUpdate({ id: guild_id }, body, { new: true }).populate({
		path: "joined_at",
		match: { id: req.user_id }
	});
	const data = guild;

	emitEvent({ event: "GUILD_UPDATE", data: data, guild_id } as GuildUpdateEvent);

	return res.json(data);
});

export default router;
