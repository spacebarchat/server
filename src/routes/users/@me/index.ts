import { Router, Request, Response } from "express";
import { UserModel, toObject } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { getPublicUser } from "../../../util/User";
import { UserModifySchema } from "../../../schema/User"
import { check } from "../../../util/instanceOf";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var publicUser = await getPublicUser(user.id);

	res.json(publicUser);
});

router.patch("/", check(UserModifySchema), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;

	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var newuser = await UserModel.findOneAndUpdate({ id: req.user_id }, {
		...body
	}).exec();

	res.json(newuser);
});

export default router;
