import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

router.post(
	"/",
	route({ right: "OPERATOR" }),
	async (req: Request, res: Response) => {
		console.log(`/stop was called by ${req.user_id} at ${new Date()}`);
		res.sendStatus(200);
		process.kill(process.pid, "SIGTERM");
	},
);

export default router;
