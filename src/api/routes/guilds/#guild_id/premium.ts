import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/subscriptions", route({}), async (req: Request, res: Response) => {
	// TODO: implement route
	res.json([]);
});

export default router;
