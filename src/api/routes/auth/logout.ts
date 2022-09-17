import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router: Router = Router();
export default router;

router.post("/", route({}), async (req: Request, res: Response) => {
	if (req.body.provider != null || req.body.voip_provider != null) {
		console.log(`[LOGOUT]: provider or voip provider not null!`, req.body);
	} else {
		delete req.body.provider;
		delete req.body.voip_provider;
		if (Object.keys(req.body).length != 0) console.log(`[LOGOUT]: Extra fields sent in logout!`, req.body);
	}
	res.status(204).send();
});
