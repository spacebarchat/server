import { Request, Response, Router } from "express";
import { User, Application } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.send(await Application.find({ where: `"owner_id" = ${req.user_id}`, relations: ["owner", "bot"]}));
});

export interface AppliationCreateSchema {
	name: string;
	team_id?: string;
}

router.post("/", route({}), async (req: Request, res: Response) => {

	var body = req.body as AppliationCreateSchema;

	const owner = await User.findOneOrFail({ where: { id: req.user_id }});

	const genHex = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
	
	let application = new Application({
		...body,
		owner: owner,
		description: "",
		verify_key: genHex(64),
		flags: 0,
		bot_public: true,
		bot_require_code_grant: false,
		hook: true,
		store_application_state: 1,
		rpc_application_state: 0,
		redirect_uris: [],
		verification_state: 1,
		integration_public: true,
		integration_require_code_grant: true,
		discoverability_state: 1,
		discovery_eligibility_flags: 2496 //default flags
	})

	await application.save()

	res.send(application)
})

export default router;
