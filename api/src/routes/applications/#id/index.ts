import { Request, Response, Router } from "express";
import { User, Application } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {

	const application = await Application.findOneOrFail({ where: `"id" = ${req.params.id}` })

	const owner = await User.findOneOrFail({ where: { id: req.user_id }});
    const bot = await User.findOne({ where: { id: req.params.id }})
	application.assign({ owner: owner, bot: bot });

	res.send(application);
});

export default router;