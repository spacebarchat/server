import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { experiments, with_guild_experiments } from "./experiments.json";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	if (req.url.includes("with_guild_experiments=true")) return res.json(with_guild_experiments);
	return res.json(experiments);
});

export default router;
