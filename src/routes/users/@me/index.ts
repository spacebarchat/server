import { Router, Request, Response } from "express";
import { UserModel } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	// TODO: user projection
	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var publicUser = await getPublicUser(user.id);

	res.json(publicUser);
});

export default router;
