import { Request, Response, Router } from "express";
import { User, Application } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {

	const id = req.params.id

	const application = await Application.findOneOrFail({ where: {id: id}})

	const name = application.name
 
	await User.addBot({ name, id, req })

	application.assign({ bot_id: id })

	await Application.update({id}, { bot_id: id })

	res.send([]).status(204);
});

export default router;