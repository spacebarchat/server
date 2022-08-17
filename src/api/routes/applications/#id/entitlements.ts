import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO: implement route
	//const { exclude_consumed } = req.query;
	res.status(200).send([]);
});

export default router;
