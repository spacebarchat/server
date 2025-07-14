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

import { StringStringDictionary } from "../../util";

// TODO: Clean up
export type CollectiblesCategoriesResponse = CollectiblesCategoryItem[];

export interface CollectiblesCategoryStyle {
	background_colors: number[];
	button_colors: number[];
	confetti_colors: number[];
}

export interface CollectiblesCategoryItem {
	sku_id: string;
	name: string;
	summary: string;
	store_listing_id: string;
	banner: string;
	unpublished_at: string | null;
	styles: CollectiblesCategoryStyle;
	logo: string;
	hero_ranking: string[] | null;
	mobile_bg: string | null;
	pdp_bg: string | null;
	success_modal_bg: string | null;
	mobile_banner: string | null;
	featured_block: string | null;
	hero_banner: string | null;
	wide_banner: string | null;
	hero_logo: string | null;
	products: CollectiblesCategoryProductItem[];
	banner_asset?: StaticAnimatedAsset;
	hero_banner_asset?: StaticAnimatedAsset;
}

export interface StaticAnimatedAsset {
	// CDN URLs
	animated: string | null;
	static: string;
}

export interface CollectiblesCategoryProductItem {
	sku_id: string;
	name: string;
	summary: string;
	store_listing_id: string;
	banner: string;
	unpublished_at: string | null;
	styles: CollectiblesCategoryStyle;
	prices: PriceMap;
	items: ProductItem[];
	type: number;
	premium_type: number;
	category_sku_id: string;
	google_sku_ids: StringStringDictionary;
	variants?: ProductItemVariant[];
}

export interface ProductItemVariant {
	sku_id: string;
	name: string;
	name_localizations: null;
	summary: string;
	summary_localizations: null;
	store_listing_id: string;
	banner?: string;
	unpublished_at?: string | null;
	styles?: CollectiblesCategoryStyle;
	prices: PriceMap;
	items: ProductItem[];
	type: number;
	premium_type: number;
	category_sku_id: string;
	google_sku_ids?: StringStringDictionary;
	base_variant_sku_id: string;
	base_variant_name: string;
	variant_label: string;
	variant_value: string; // hex string
}

export interface ProductItem {
	type: number;
	id: string;
	sku_id: string;
	asset?: string;
	label?: string;
	palette?: string;
}

export type PriceMap = {
	[key: string]: { country_prices: CountryPrice };
};

export interface CountryPrice {
	country_code: string;
	prices: PriceEntry[];
}

export interface PriceEntry {
	amount: number;
	currency: string;
	exponent: number;
}
