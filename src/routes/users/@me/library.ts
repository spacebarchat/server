import { Router, Response, Request } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	// TODO:
	res.status(200).send([]);
});

export default router;
