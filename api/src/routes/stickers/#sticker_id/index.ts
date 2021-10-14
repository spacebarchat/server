import { Sticker } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { sticker_id } = req.params;

	res.json(await Sticker.find({ id: sticker_id }));
});

export default router;
