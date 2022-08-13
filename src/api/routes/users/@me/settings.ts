import { Router, Response, Request } from "express";
import { User, UserSettings } from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

router.patch("/", route({ body: "UserSettingsSchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserSettings;
	if (body.locale === "en") body.locale = "en-US"; // fix discord client crash on unkown locale

	const user = await User.findOneOrFail({ where: { id: req.user_id, bot: false }, relations: ["settings"] });
	user.settings = { ...user.settings, ...body } as UserSettings;
	await user.save();

	res.sendStatus(204);
});

export default router;
