import { Guild } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { limit } = req.params;

	// ! this only works using SQL querys
	// TODO: implement this with default typeorm query
	// const guilds = await Guild.find({ where: { features: "DISCOVERABLE" } }); //, take: Math.abs(Number(limit)) });
	const guilds = await Guild.find({ where: `"features" LIKE 'COMMUNITY'`, take: Math.abs(Number(limit)) });
	res.send({ guilds: guilds });
});

export default router;
