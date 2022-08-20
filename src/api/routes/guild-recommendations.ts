import { Config, Guild } from "@fosscord/util";

import { Request, Response, Router } from "express";
import { Like } from "typeorm";
import { route } from "..";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { limit, personalization_disabled } = req.query;
	let showAllGuilds = Config.get().guild.discovery.showAllGuilds;
	// ! this only works using SQL querys
	// TODO: implement this with default typeorm query
	// const guilds = await Guild.find({ where: { features: "DISCOVERABLE" } }); //, take: Math.abs(Number(limit)) });

	const genLoadId = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

	const guilds = showAllGuilds
		? await Guild.find({ take: Math.abs(Number(limit || 24)) })
		: await Guild.find({ where: { features: Like("%DISCOVERABLE%") }, take: Math.abs(Number(limit || 24)) });
	res.send({ recommended_guilds: guilds, load_id: `server_recs/${genLoadId(32)}` }).status(200);
});

export default router;
