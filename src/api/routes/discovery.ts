import { Categories } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "..";

const router = Router();

router.get("/categories", route({}), async (req: Request, res: Response) => {
	// TODO:
	// Get locale instead

	const { locale, primary_only } = req.query;

	const out = primary_only ? await Categories.find() : await Categories.find({ where: { is_primary: true } });

	res.send(out);
});

export default router;
