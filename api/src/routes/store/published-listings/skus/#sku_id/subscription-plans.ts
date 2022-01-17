import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();

const skus = new Map([
	[
		"521842865731534868",
		[
			{
				id: "511651856145973248",
				name: "Premium Monthly (Legacy)",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521842865731534868",
				currency: "usd",
				price: 0,
				price_tier: null
			},
			{
				id: "511651860671627264",
				name: "Premium Yearly (Legacy)",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521842865731534868",
				currency: "usd",
				price: 0,
				price_tier: null
			}
		]
	],
	[
		"521846918637420545",
		[
			{
				id: "511651871736201216",
				name: "Premium Classic Monthly",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521846918637420545",
				currency: "usd",
				price: 0,
				price_tier: null
			},
			{
				id: "511651876987469824",
				name: "Premium Classic Yearly",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521846918637420545",
				currency: "usd",
				price: 0,
				price_tier: null
			}
		]
	],
	[
		"521847234246082599",
		[
			{
				id: "642251038925127690",
				name: "Premium Quarterly",
				interval: 1,
				interval_count: 3,
				tax_inclusive: true,
				sku_id: "521847234246082599",
				currency: "usd",
				price: 0,
				price_tier: null
			},
			{
				id: "511651880837840896",
				name: "Premium Monthly",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521847234246082599",
				currency: "usd",
				price: 0,
				price_tier: null
			},
			{
				id: "511651885459963904",
				name: "Premium Yearly",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521847234246082599",
				currency: "usd",
				price: 0,
				price_tier: null
			}
		]
	],
	[
		"590663762298667008",
		[
			{
				id: "590665532894740483",
				name: "Server Boost Monthly",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "590663762298667008",
				discount_price: 0,
				currency: "usd",
				price: 0,
				price_tier: null
			},
			{
				id: "590665538238152709",
				name: "Server Boost Yearly",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "590663762298667008",
				discount_price: 0,
				currency: "usd",
				price: 0,
				price_tier: null
			}
		]
	]
]);

router.get("/", route({}), async (req: Request, res: Response) => {
	// TODO: add the ability to add custom
	const { sku_id } = req.params;

	if (!skus.has(sku_id)) {
		console.log(`Request for invalid SKU ${sku_id}! Please report this!`);
		res.sendStatus(404);
	} else {
		res.json(skus.get(sku_id)).status(200);
	}
});

export default router;
