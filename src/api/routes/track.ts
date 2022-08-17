import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.post("/", route({}), (req: Request, res: Response) => {
	// TODO: implement route?
	res.sendStatus(204);
});

export default router;
