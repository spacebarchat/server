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

import { CollectiblesCategoryItem, StaticAnimatedAsset } from "./CollectiblesCategoriesResponse";

export interface CollectiblesShopResponse {
    shop_blocks: AnyShopBlock[];
    categories: CollectiblesCategoryItem[];
}

export type AnyShopBlock = ItemRowShopBlock | BundleTileRowShopBlock | ItemCollectionShopBlock;

export interface BaseShopBlock {
    type: number;
}

export interface ItemRowShopBlock extends BaseShopBlock {
    type: 0;
    category_sku_id: string;
    name: string;
    category_store_listing_id: string;
    banner_asset: StaticAnimatedAsset;
    logo_url: string;
    unpublished_at: string | null;
    summary: string;
    ranked_sku_ids: string[];
}

export interface BundleTileRowShopBlock extends BaseShopBlock {
    type: 1;
    subblocks: ShopBlockSubBlock[];
}

export interface ShopBlockSubBlock {
    type: number;
    category_store_listing_id: string;
    name: string;
    unpublished_at: string | null;
    banner_url: string;
    body_text: string | null;
    banner_text_color: number | null;
}

export interface ItemCollectionShopBlock extends BaseShopBlock {
    type: 2;
    ranked_sku_ids: string[];
    sorted_sku_ids: {
        recommended: string[] | null;
        popular: string[];
    };
}
