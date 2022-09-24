import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";
import { getOrInitialiseDatabase } from "util/util";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	try {
		// test that the database is alive & responding
		await getOrInitialiseDatabase();
		return res.sendStatus(200);
	} catch (e) {
		res.sendStatus(503);
	}
});

export default router;
