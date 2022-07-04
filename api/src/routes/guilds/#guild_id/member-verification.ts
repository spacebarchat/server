import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
const router = Router();

router.get("/",route({}), async (req: Request, res: Response) => {
	// TODO: member verification

	res.status(404).json({
		message: "Unknown Guild Member Verification Form",
		code: 10068
	});
});

export default router;
