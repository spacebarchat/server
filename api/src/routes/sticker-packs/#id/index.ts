import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	//TODO
	res.json({
		id: "",
		stickers: [],
		name: "",
		sku_id: "",
		cover_sticker_id: "",
		description: "",
		banner_asset_id: ""
	}).status(200);
});

export default router;
