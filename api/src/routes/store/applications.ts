import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/applications/:id", async (req: Request, res: Response) => {
	//TODO 
    const { id } = req.params;
	res.json([]).status(200);
});

export default router;