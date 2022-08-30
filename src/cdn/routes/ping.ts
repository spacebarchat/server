import { Request, Response, Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.send("pong");
});

export default router;
