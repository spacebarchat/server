import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

router.put("/:id", route({}), async (req: Request, res: Response) => {
	//TODO
	res.json({
		message: "Unknown User",
		code: 10013
	}).status(404);
});

export default router;
