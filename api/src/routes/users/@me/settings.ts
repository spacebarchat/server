import { Router, Response, Request } from "express";

const router = Router();

router.patch("/", (req: Request, res: Response) => {
	// TODO:
	res.sendStatus(204);
});

export default router;
