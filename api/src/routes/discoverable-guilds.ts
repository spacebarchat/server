import { Guild } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { In } from "typeorm";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { limit } = req.params;

	const guilds = await Guild.find({ where: { features: "PENIS" } }); //, take: Math.abs(Number(limit)) });
	res.send({ guilds: guilds });
});

export default router;
