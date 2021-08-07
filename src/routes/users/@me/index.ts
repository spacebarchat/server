import { Router, Request, Response } from "express";
import { UserModel, toObject, PublicUserProjection } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { getPublicUser } from "../../../util/User";
import { UserModifySchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { handleFile } from "../../../util/cdn";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	res.json(await getPublicUser(req.user_id));
});

router.patch("/", check(UserModifySchema), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;
	body.avatar = await handleFile(`/avatars/${req.user_id}`, body.avatar as string);

	const user = await UserModel.findOneAndUpdate({ id: req.user_id }, body, { projection: PublicUserProjection }).exec();
	// TODO: dispatch user update event

	res.json(toObject(user));
});

export default router;
