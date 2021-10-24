import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	//TODO
	res.json([
		{
			id: "",
			name: "",
			interval: 1,
			interval_count: 1,
			tax_inclusive: true,
			sku_id: "",
			fallback_price: 499,
			fallback_currency: "eur",
			currency: "eur",
			price: 4199,
			price_tier: null
		}
	]).status(200);
});

export default router;
