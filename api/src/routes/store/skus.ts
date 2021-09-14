import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/skus/:id", async (req: Request, res: Response) => {
	//TODO
    const { id } = req.params;
	res.json([]).status(200);
});

export default router;