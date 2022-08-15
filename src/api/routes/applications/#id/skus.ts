import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]).status(200);
});

export default router;
