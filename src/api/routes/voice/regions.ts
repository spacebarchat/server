import { Request, Response, Router } from "express";
import { getIpAdress, getVoiceRegions, route } from "../..";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.json(await getVoiceRegions(getIpAdress(req), true)); //vip true?
});

export default router;
