import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/gifts", route({}), (req: Request, res: Response) => {
	// TODO:
	res.json([]).status(200);
});

export default router;
