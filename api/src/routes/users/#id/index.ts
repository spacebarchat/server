import { Router, Request, Response } from "express";
import { User } from "@fosscord/util";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { id } = req.params;

	res.json(await User.getPublicUser(id));
});

export default router;
