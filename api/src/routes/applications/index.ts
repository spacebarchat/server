import { Router, Request, Response } from "express";
import { Application, User } from "@fosscord/util";
import { route } from "@fosscord/api";
import { generateToken } from "../auth/login";

const router: Router = Router();

export interface ApplicationCreateSchema {
	/**
	 * @minLength 2
	 * @maxLength 32
	 */
	name: string;
	team_id: number;
}

router.get("/", route({}), async (req: Request, res: Response) => {
	const applications = await Application.find({ where: { owner_id: req.user_id }, relations: ["owner", "team", "guild", "bot"] });

	res.json(
		await Promise.all(
			applications.map(async (x) => {
				// @ts-ignore
				if (x.bot) x.bot.token = await generateToken(x.bot.id);
				return x;
			})
		)
	);
});

router.post(
	"/",
	route({ body: "ApplicationCreateSchema" }),

	//TODO to get finished
	async (req: Request, res: Response) => {
		const { name, team_id } = req.body as ApplicationCreateSchema;

		const application = await new Application({
			name: name,
			description: "",
			bot_public: true,
			bot_require_code_grant: false,
			owner_id: req.user_id,
			owner: await User.getPublicUser(req.user_id),
			summary: null,
			verify_key: "",
			flags: 0
		}).save();

		res.status(201).json(application);
	}
);
export default router;
