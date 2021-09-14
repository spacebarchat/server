import { Router, Request, Response } from "express";
import { Application, User } from "@fosscord/util";
import { handleFile, route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {});

router.post("/", route({}), async (req: Request, res: Response) => {
	const application = await Application.findOneOrFail({ id: req.params.id, owner_id: req.user_id });

	const bot = await User.register({
		username: application.name,
		bot: true,
		data: {
			valid_tokens_since: new Date()
		}
	});

	application.bot = bot;
	await application.save();

	return res.json(bot);
});

export default router;
