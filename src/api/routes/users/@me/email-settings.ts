import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO:
	res.json({
		categories: {
			social: true,
			communication: true,
			tips: false,
			updates_and_announcements: false,
			recommendations_and_events: false
		},
		initialized: false
	}).status(200);
});

export default router;
