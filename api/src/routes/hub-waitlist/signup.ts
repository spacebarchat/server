import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
const router = Router();

router.post("/",route({}), async (req: Request, res: Response) => {
    //TODO
    const { email, school } = req.body;
	res.json({ email: email, email_domain: email.split("@")[1], school: school, user_id: req.user_id });
});

export default router;
