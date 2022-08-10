import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { Application, OrmUtils, Team, trimSpecial, User } from "@fosscord/util";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	let results = await Application.findOne({where: {id: req.params.id}, relations: ["owner", "bot"] });
	res.json(results).status(200);
});

router.patch("/", route({}), async (req: Request, res: Response) => {
	delete req.body.icon;
	let app = OrmUtils.mergeDeep(await Application.findOne({where: {id: req.params.id}, relations: ["owner", "bot"]}), req.body);
	if(app.bot) {
		app.bot.bio = req.body.description
		app.bot?.save();
	}
	if(req.body.tags) app.tags = req.body.tags;
	await app.save();
	res.json(app).status(200);
});

router.post("/delete", route({}), async (req: Request, res: Response) => {
	await Application.delete(req.params.id);
	res.send().status(200);
});


export default router;