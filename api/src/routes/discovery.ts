import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/categories", route({}), (req: Request, res: Response) => {
	// TODO:
	//const { locale, primary_only } = req.query;
	res.json([]).status(200);
});

export default router;
