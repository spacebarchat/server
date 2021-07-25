import { Config } from "@fosscord/server-util";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	return res.json(Config.get().regions.available);
});

export default router;