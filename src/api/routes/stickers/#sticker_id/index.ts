import { route } from "@fosscord/api";
import { Sticker } from "@fosscord/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { sticker_id } = req.params;

	res.json(await Sticker.find({ where: { id: sticker_id } }));
});

export default router;
