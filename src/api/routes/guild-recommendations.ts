import { Guild, Config } from "@fosscord/util";

import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Like } from "typeorm";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	// const { limit, personalization_disabled } = req.query;
	const { limit } = req.query;
	const showAllGuilds = Config.get().guild.discovery.showAllGuilds;

	const genLoadId = (size: number) =>
		[...Array(size)]
			.map(() => Math.floor(Math.random() * 16).toString(16))
			.join("");

	const guilds = showAllGuilds
		? await Guild.find({ take: Math.abs(Number(limit || 24)) })
		: await Guild.find({
				where: { features: Like("%DISCOVERABLE%") },
				take: Math.abs(Number(limit || 24)),
		  });
	res.send({
		recommended_guilds: guilds,
		load_id: `server_recs/${genLoadId(32)}`,
	}).status(200);
});

export default router;
