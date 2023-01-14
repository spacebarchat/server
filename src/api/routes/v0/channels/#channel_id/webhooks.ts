import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

//TODO: implement webhooks
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]);
});

export default router;
