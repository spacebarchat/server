import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	//TODO
	res.json([]).status(200);
});

export default router;