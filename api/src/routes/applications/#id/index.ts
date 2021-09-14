import { Router, Request, Response } from "express";
import { Application } from "@fosscord/util";
import { handleFile, route } from "@fosscord/api";
import { generateToken } from "../../auth/login";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const application = (
		await Application.findOneOrFail({
			where: { owner_id: req.user_id, id: req.params.id },
			relations: ["owner", "team", "guild", "bot"]
		})
	).toJSON();

	// @ts-ignore
	if (application.bot) application.bot.token = await generateToken(application.bot.id);

	res.json(application);
});

export interface ApplicationModifySchema {
	/**
	 * @minLength 2
	 * @maxLength 32
	 */
	name: string;
	icon?: string;
	description: string;
	interactions_endpoint_url?: string;
	terms_of_service_url?: string;
	privacy_policy_url?: string;
	bot_public?: boolean;
	bot_require_code_grant?: boolean;
	// flags?: number; // TODO: check if flags are permitted
}

router.patch("/", route({ body: "ApplicationModifySchema" }), async (req: Request, res: Response) => {
	const body = req.body as ApplicationModifySchema;
	if (body.icon) body.icon = await handleFile(`/app-icons/${req.params.id}`, body.icon);

	await Application.update({ id: req.params.id, owner_id: req.user_id }, body);

	res.json(
		await Application.findOneOrFail({
			where: { owner_id: req.user_id, id: req.params.id },
			relations: ["owner", "team", "guild", "bot"]
		})
	);
});

export default router;
