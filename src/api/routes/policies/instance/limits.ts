import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { limits } = Config.get();
	res.json(limits);
});

export default router;
