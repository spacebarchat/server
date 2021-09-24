import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/applications/:id", route({}), async (req: Request, res: Response) => {
	//TODO
	const { id } = req.params;
	res.json([]).status(200);
});

export default router;
