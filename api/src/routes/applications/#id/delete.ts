import { Request, Response, Router } from "express";
import { User, Application, Member } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {

	const application = await Application.findOneOrFail({ where: { id: req.params.id }, relations: ["owner", "bot"]})

	if (application.owner!.id == req.user_id) {
		await Promise.all([
			Application.delete({ id: application.id }),
			User.delete({ id: application.id }),
			Member.delete({ id: application.id })
		]);
	}
	res.send([]).status(204);
});

export default router;
