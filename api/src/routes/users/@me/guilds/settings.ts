import { Router, Response, Request } from "express";
import { Member, UserGuildSettings } from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

export interface UserGuildSettingsSchema extends Partial<UserGuildSettings> { }

// GET doesn't exist on discord.com
router.get("/", route({}), async (req: Request, res: Response) => {
	const user = await Member.findOneOrFail({
		where: { id: req.user_id },
		select: ["settings"]
	});
	return res.json(user.settings);
});

router.patch("/", route({ body: "UserSettingsSchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserGuildSettings;

	const user = await Member.findOneOrFail({ where: { id: req.user_id } });
	user.settings = { ...user.settings, ...body };
	await user.save();

	res.json(user.settings);
});

export default router;
