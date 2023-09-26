import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	// TODO: support lemmy ChatMessage type?
	// TODO: check if the activity exists on the remote server
});

export default router;
