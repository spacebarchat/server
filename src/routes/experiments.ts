import { Router, Response, Request } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	// TODO:
	res.send({ fingerprint: "", assignments: [] });
});

export default router;
