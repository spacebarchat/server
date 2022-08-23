import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router: Router = Router();

const skus = new Map([
	[
		"521842865731534868",
		[
			{
				id: "511651856145973248",
				name: "Individual Premium Tier 2 Monthly (Legacy)",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521842865731534868",
				currency: "eur",
				price: 0,
				price_tier: null
			},
			{
				id: "511651860671627264",
				name: "Individiual Premium Tier 2 Yearly (Legacy)",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521842865731534868",
				currency: "eur",
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
				name: "Individual Premium Tier 1 Monthly",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521846918637420545",
				currency: "eur",
				price: 0,
				price_tier: null
			},
			{
				id: "511651876987469824",
				name: "Individual Premum Tier 1 Yearly",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521846918637420545",
				currency: "eur",
				price: 0,
				price_tier: null
			},
			{
				id: "978380684370378761",
				name: "Individual Premum Tier 0",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521846918637420545",
				currency: "eur",
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
				name: "Individual Premium Tier 2 Quarterly",
				interval: 1,
				interval_count: 3,
				tax_inclusive: true,
				sku_id: "521847234246082599",
				currency: "eur",
				price: 0,
				price_tier: null
			},
			{
				id: "511651880837840896",
				name: "Individual Premium Tier 2 Monthly",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521847234246082599",
				currency: "eur",
				price: 0,
				price_tier: null
			},
			{
				id: "511651885459963904",
				name: "Individual Premium Tier 2 Yearly",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "521847234246082599",
				currency: "eur",
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
				name: "Crowd Premium Monthly",
				interval: 1,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "590663762298667008",
				discount_price: 0,
				currency: "eur",
				price: 0,
				price_tier: null
			},
			{
				id: "590665538238152709",
				name: "Crowd Premium Yearly",
				interval: 2,
				interval_count: 1,
				tax_inclusive: true,
				sku_id: "590663762298667008",
				discount_price: 0,
				currency: "eur",
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
