import { Router, Request, Response } from "express";
import {getIpAdress} from "../../util/ipAddress";
import {getVoiceRegions} from "../../util/Voice";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
    res.json(await getVoiceRegions(getIpAdress(req), true))//vip true?
});

export default router;
