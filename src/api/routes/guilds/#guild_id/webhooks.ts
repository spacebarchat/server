import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";
const router = Router();

//TODO: implement webhooks
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]);
});
export default router;
