import { route } from "@fosscord/api";
import { Router, Request, Response } from "express";
const router = Router();

router.get("/", route({ permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	// TODO: integrations (followed channels, youtube, twitch)
	res.send([]);
});

export default router;
