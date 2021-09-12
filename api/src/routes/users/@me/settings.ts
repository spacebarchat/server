import { Router, Response, Request } from "express";
import { User, UserSettings } from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

export interface UserSettingsSchema extends UserSettings {}

router.patch("/", route({ body: "UserSettingsSchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserSettings;

	// only users can update user settings
	await User.update({ id: req.user_id, bot: false }, { settings: body });

	res.sendStatus(204);
});

export default router;
