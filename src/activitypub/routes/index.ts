import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.send("Online");
});

export default router;
