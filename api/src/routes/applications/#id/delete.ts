import { Request, Response, Router } from "express";
import { User, Application, Member } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {

	const application = await Application.findOneOrFail({ where: `"id" = ${req.params.id}`})

	if (application.owner_id == req.user_id) {
		await Promise.all([
			Application.delete({ id: req.params.id }),
			User.delete({ id: req.params.id }),
			Member.delete({ id: req.params.id })
		]);
	}
	res.send([]).status(204);
});

export default router;
