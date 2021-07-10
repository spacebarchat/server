import { Request, Response, Router } from "express";
import { GuildModel, getPermission, toObject, Snowflake } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import { isMember } from "../../../util/Member";
import { GuildAddChannelToWelcomeScreenSchema } from "../../../schema/Guild";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;

	const guild = await GuildModel.findOne({ id: guild_id });

	await isMember(req.user_id, guild_id);

	res.json(toObject(guild.welcome_screen));
});

router.post("/", check(GuildAddChannelToWelcomeScreenSchema), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const body = req.body as GuildAddChannelToWelcomeScreenSchema;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();

	var channelObject = {
		...body
	};

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	if (!guild.welcome_screen.enabled) throw new HTTPError("Welcome screen disabled", 400);
	if (guild.welcome_screen.welcome_channels.some((channel) => channel.channel_id === body.channel_id))
		throw new Error("Welcome Channel exists");

	await GuildModel.findOneAndUpdate(
		{
			id: guild_id
		},
		{ $push: { "welcome_screen.welcome_channels": channelObject } }
	).exec();

	res.sendStatus(204);
});

export default router;
