import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO:
	//const { exclude_consumed } = req.query;
	res.status(200).send([]);
});

export default router;
