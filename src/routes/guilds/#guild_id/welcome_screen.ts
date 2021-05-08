import { Request, Response, Router } from "express";
import { GuildModel, getPermission, toObject, Snowflake } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import { GuildAddChannelToWelcomeScreenSchema } from "../../../schema/Guild";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const guild_id = req.params.id;

	const guild = await GuildModel.findOne({ id: guild_id });
	if (!guild) throw new HTTPError("Guild not found", 404);

	res.json(toObject(guild.welcome_screen));
});


export default router;
