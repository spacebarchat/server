import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router: Router = Router();

const skus = new Map([
	[
		"521842865731534868",
		[
			{
				id: "511651856145973248",
				name: "Individual Premium Tier 3 Monthly (Legacy)",
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
				name: "Individiual Premium Tier 3 Yearly (Legacy)",
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
				name: "Individual Premium Tier 2 Monthly",
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
				name: "Individual Premum Tier 2 Yearly",
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
				name: "Individual Premum Tier 1",
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
				name: "Individual Premium Tier 3 Quarterly",
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
				name: "Individual Premium Tier 3 Monthly",
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
				name: "Individual Premium Tier 3 Yearly",
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
		],
	],
	[
		"978380684370378762",
		[
			[
				{
					"id": "978380692553465866",
					"name": "Premium Tier 0 Monthly",
					"interval": 1,
					"interval_count": 1,
					"tax_inclusive": true,
					"sku_id": "978380684370378762",
					"currency": "usd",
					"price": 299,
					"price_tier": null,
					"prices": {
						"0": {
							"country_prices": {
								"country_code": "US",
								"prices": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							},
							"payment_source_prices": {
								"775487223059316758": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"736345864146255982": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"683074999590060249": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							}
						},
						"3": {
							"country_prices": {
								"country_code": "US",
								"prices": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							},
							"payment_source_prices": {
								"775487223059316758": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"736345864146255982": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"683074999590060249": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							}
						},
						"4": {
							"country_prices": {
								"country_code": "US",
								"prices": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							},
							"payment_source_prices": {
								"775487223059316758": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"736345864146255982": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"683074999590060249": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							}
						},
						"1": {
							"country_prices": {
								"country_code": "US",
								"prices": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							},
							"payment_source_prices": {
								"775487223059316758": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"736345864146255982": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								],
								"683074999590060249": [
									{
										"currency": "usd",
										"amount": 0,
										"exponent": 2
									}
								]
							}
						}
					}
				}
			]
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
