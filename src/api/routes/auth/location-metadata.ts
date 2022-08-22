import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { getIpAdress, IPAnalysis } from "@fosscord/api";
const router = Router();

router.get("/",route({}), async (req: Request, res: Response) => {
    //TODO
    //Note: It's most likely related to legal. At the moment Discord hasn't finished this too
    const country_code = (await IPAnalysis(getIpAdress(req))).country_code;
	res.json({ consent_required: false, country_code: country_code, promotional_email_opt_in: { required: true, pre_checked: false}});
});

export default router;
