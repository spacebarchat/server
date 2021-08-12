import { Router, Response, Request } from "express";
import { check, Length } from "../../../util/instanceOf";
import { ChannelModel, getPermission, trimSpecial } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { isTextChannel } from "./messages/index";

const router: Router = Router();
// TODO:

// TODO: use Image Data Type for avatar instead of String
router.post("/", check({ name: new Length(String, 1, 80), $avatar: String }), async (req: Request, res: Response) => {
	const channel_id = req.params.channel_id;
	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true, type: true }).exec();

	isTextChannel(channel.type);
	if (!channel.guild_id) throw new HTTPError("Not a guild channel", 400);

	const permission = await getPermission(req.user_id, channel.guild_id);
	permission.hasThrow("MANAGE_WEBHOOKS");

	var { avatar, name } = req.body as { name: string; avatar?: string };
	name = trimSpecial(name);
	if (name === "clyde") throw new HTTPError("Invalid name", 400);
});

export default router;
