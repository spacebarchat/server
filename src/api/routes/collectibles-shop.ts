/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { Config } from "@spacebar/util";
import { CollectiblesCategoryItem, CollectiblesShopResponse, ItemRowShopBlock } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "CollectiblesShopResponse",
            },
            204: {},
        },
    }),
    (req: Request, res: Response) => {
        const { endpointPublic: publicCdnEndpoint } = Config.get().cdn;
        res.send({ shop_blocks: [], categories: [] });
        // res.send({
        // 	shop_blocks: [
        // 		{
        // 			type: 0,
        // 			banner_asset: {
        // 				animated: null,
        // 				static: `${publicCdnEndpoint}/content/store/banners/main-store-banner.png`,
        // 			},
        // 			summary: "Welcome! Don't go alone, take this! :)",
        // 			category_sku_id: "spacebarshop",
        // 			name: "Spacebar",
        // 			category_store_listing_id: "a",
        // 			logo_url: "",
        // 			unpublished_at: null,
        // 			ranked_sku_ids: [],
        // 		},
        // 	],
        // 	categories: [
        // 		{
        // 			sku_id: "spacebarshop",
        // 			name: "Spacebar shop category",
        // 			summary: "Spacebar shop category items",
        //
        // 		}
        // 	],
        // } as CollectiblesShopResponse);
    },
);

export default router;
