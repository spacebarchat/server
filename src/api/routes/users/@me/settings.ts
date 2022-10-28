import { Router, Response, Request } from "express";
import { OrmUtils, User, UserSettingsSchema } from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({
		where: { id: req.user_id },
		select: ["settings"],
	});
	return res.json(user.settings);
});

router.patch(
	"/",
	route({ body: "UserSettingsSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as UserSettingsSchema;
		if (body.locale === "en") body.locale = "en-US"; // fix discord client crash on unkown locale

		const user = await User.findOneOrFail({
			where: { id: req.user_id, bot: false },
			select: ["settings"]
		});
		user.settings = OrmUtils.mergeDeep(user.settings, body);
		User.update({ id: user.id }, { settings: user.settings });

		res.json(user.settings);
	},
);

export default router;
