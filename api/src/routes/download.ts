import { Router, Response, Request } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.send("We don't support donwloads at the moment.");
});

export default router;
