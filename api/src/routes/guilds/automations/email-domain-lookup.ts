import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
const router = Router();

router.post("/",route({}), async (req: Request, res: Response) => {
    //TODO
    const { allow_multiple_guilds, email, use_verification_code } = req.body;
	res.json({ guilds_info: [], has_matching_guild: false });
});

export default router;
