import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";

const router = Router();
const { general } = Config.get();

router.get("/",route({}), async (req: Request, res: Response) => {
	res.json(general)
});

export default router;
