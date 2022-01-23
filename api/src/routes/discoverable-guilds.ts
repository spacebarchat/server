import { Guild, Config } from "@fosscord/util";

import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { limit, categories } = req.query;
	var showAllGuilds = Config.get().guild.showAllGuildsInDiscovery;
	// ! this only works using SQL querys
	// TODO: implement this with default typeorm query
	// const guilds = await Guild.find({ where: { features: "DISCOVERABLE" } }); //, take: Math.abs(Number(limit)) });
	let guilds;
	let total;
	switch (categories) {
		case "1":
			guilds = showAllGuilds
				? await Guild.find({ take: Math.abs(Number(limit || 24)) })
				: await Guild.find({ where: `"primary_category_id" = 1 AND "features" LIKE '%COMMUNITY%'`, take: Math.abs(Number(limit || 24)) });
			total = guilds.length;
		default:
			guilds = showAllGuilds
				? await Guild.find({ take: Math.abs(Number(limit || 24)) })
				: await Guild.find({ where: `"features" LIKE '%COMMUNITY%'`, take: Math.abs(Number(limit || 24)) });
			total = guilds.length;
	}
	res.send({ total: total, guilds: guilds, offset: 0, limit: limit});
});

export default router;
