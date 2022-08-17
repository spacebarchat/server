import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO: implement route
	res.status(200).send({ user_affinities: [], inverse_user_affinities: [] });
});

export default router;
