import { Router, Request, Response } from "express";
import { getPublicUser } from "../../../util/User";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await getPublicUser(id);
	if (!user) throw new HTTPError("User not found", 404);

	res.json(user);
});

export default router;
