import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO:
	res.status(200).send({ user_affinities: [], inverse_user_affinities: [] });
});

export default router;
