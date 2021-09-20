import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	//TODO
	res.json({ sticker_packs: [] }).status(200);
});

export default router;