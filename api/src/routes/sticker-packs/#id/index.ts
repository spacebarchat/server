import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
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