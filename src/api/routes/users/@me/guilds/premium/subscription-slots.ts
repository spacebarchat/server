import { Request, Response, Router } from "express";
import { route } from "../../../../..";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO:
	res.json([]).status(200);
});

export default router;
