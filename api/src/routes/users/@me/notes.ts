import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

router.put("/", route({}), async (req: Request, res: Response) => {
	//TODO
	res.json({code: 0}).status(400);
});

export default router;
