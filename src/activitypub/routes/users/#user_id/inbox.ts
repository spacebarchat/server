import { genericInboxHandler } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	res.json(await genericInboxHandler(req));
});

export default router;
