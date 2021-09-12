import { Router, Request, Response } from "express";
import { getIpAdress } from "@fosscord/api";
import { getVoiceRegions } from "@fosscord/api";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	res.json(await getVoiceRegions(getIpAdress(req), true)); //vip true?
});

export default router;
