import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	// TODO:
	const { connection_name, connection_id } = req.params;
	res.sendStatus(204);
});

export default router;
