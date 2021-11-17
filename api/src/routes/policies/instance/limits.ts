import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";
const router = Router();
const { limits } = Config.get();

router.get("/",route({}), async (req: Request, res: Response) => {
	res.json(limits)
});

export default router;
