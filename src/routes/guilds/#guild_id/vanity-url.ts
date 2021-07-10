import { GuildModel } from "@fosscord/server-util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild.vanity_url) throw new HTTPError("This guild has no vanity url", 204);

	return res.json({ vanity_ur: guild.vanity_url });
});

export default router;
