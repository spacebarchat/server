import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	// TODO: member verification

	res.status(404).json({
		message: "Unknown Guild Member Verification Form",
		code: 10068
	});
});

export default router;
