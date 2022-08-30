import { Config, Guild } from "@fosscord/util";

import { Request, Response, Router } from "express";
import { Like } from "typeorm";
import { route } from "..";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { offset, limit, categories } = req.query;
	let showAllGuilds = Config.get().guild.discovery.showAllGuilds;
	let configLimit = Config.get().guild.discovery.limit;
	// ! this only works using SQL querys
	// const guilds = await Guild.find({ where: { features: "DISCOVERABLE" } }); //, take: Math.abs(Number(limit)) });
	let guilds;
	if (categories == undefined) {
		guilds = showAllGuilds
			? await Guild.find({ take: Math.abs(Number(limit || configLimit)) })
			: await Guild.find({ where: { features: Like("%DISCOVERABLE%") }, take: Math.abs(Number(limit || configLimit)) });
	} else {
		guilds = showAllGuilds
			? await Guild.find({ where: { primary_category_id: Number(categories) }, take: Math.abs(Number(limit || configLimit)) })
			: await Guild.find({
					where: { primary_category_id: Number(categories), features: Like("%DISCOVERABLE%") },
					take: Math.abs(Number(limit || configLimit))
			  });
	}

	const total = guilds ? guilds.length : undefined;

	res.send({
		total: total,
		guilds: guilds,
		offset: Number(offset || Config.get().guild.discovery.offset),
		limit: Number(limit || configLimit)
	});
});

export default router;
