import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import {
	Application,
	ApplicationCreateSchema,
	trimSpecial,
	User,
} from "@fosscord/util";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	let results = await Application.find({
		where: { owner: { id: req.user_id } },
		relations: ["owner", "bot"],
	});
	res.json(results).status(200);
});

router.post(
	"/",
	route({ body: "ApplicationCreateSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as ApplicationCreateSchema;
		const user = await User.findOneOrFail({ where: { id: req.user_id } });

		const app = Application.create({
			name: trimSpecial(body.name),
			description: "",
			bot_public: true,
			owner: user,
			verify_key: "IMPLEMENTME",
			flags: 0,
		});

		await app.save();

		res.json(app);
	},
);

export default router;
