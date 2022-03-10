import { Request, Response, Router } from "express";
import { User, Application } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {

	const { application_id } = req.params

	const application = await Application.findOneOrFail({ where: {id: application_id}})

	const name = application.name
 
	await User.addBot({ name, id: application_id, req })

	//TODO: Application.update never works
	await Application.update({id: application_id}, { bot_id: application_id })

	res.send([]).status(204);
});

export default router;