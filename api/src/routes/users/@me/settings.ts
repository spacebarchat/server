import { Router, Response, Request } from "express";
import { UserModel, UserSettings } from "@fosscord/util";
import { check } from "../../../util/instanceOf";
import { UserSettingsSchema } from "../../../schema/User";

const router = Router();

router.patch("/", check(UserSettingsSchema), async (req: Request, res: Response) => {
	const body = req.body as UserSettings;

	await UserModel.updateOne({ id: req.user_id }, body).exec();

	res.sendStatus(204);
});

export default router;
