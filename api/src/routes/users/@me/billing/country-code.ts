import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	//TODO
	res.json({ "country_code": "US" }).status(200);
});

export default router;