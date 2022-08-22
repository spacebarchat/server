import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/gifts", route({}), (req: Request, res: Response) => {
	// TODO:
	res.json([]).status(200);
});

export default router;
