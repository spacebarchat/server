import { Router, Request, Response } from "express";
import { getPublicUser } from "../../../util/User";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { id } = req.params;

	res.json(await getPublicUser(id));
});

export default router;
