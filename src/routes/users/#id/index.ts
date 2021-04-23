import { Router, Request, Response } from "express";
import { UserModel } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await UserModel.findOne({ id: id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	res.json(user);
});

export default router;
