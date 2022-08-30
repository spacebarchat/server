import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	//TODO
	res.json([]);
});

export default router;
