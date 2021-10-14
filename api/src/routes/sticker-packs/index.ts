import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { StickerPack } from "@fosscord/util/src/entities/StickerPack";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.json(await StickerPack.find({}));
});

export default router;
