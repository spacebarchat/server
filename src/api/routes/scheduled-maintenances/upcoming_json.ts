import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/scheduled-maintenances/upcoming.json", route({}), async (req: Request, res: Response) => {
	res.json({
		page: {},
		scheduled_maintenances: {}
	});
});

export default router;
