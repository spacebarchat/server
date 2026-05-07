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

import type { StringStringDictionary } from "../HelperTypes";

export type CollectiblesCategoriesResponse = CollectiblesCategory[];

export interface CollectiblesCategoryStyle {
    background_colors: number[];
    button_colors: number[];
    confetti_colors: number[];
}

export interface CollectiblesCategory {
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
    products: CollectiblesCategoryProduct[];
    banner_asset?: CollectiblesStaticAnimatedAsset;
    hero_banner_asset?: CollectiblesStaticAnimatedAsset;
}

export interface CollectiblesStaticAnimatedAsset {
    // CDN URLs
    animated: string | null;
    static: string;
}

export interface CollectiblesCategoryProduct {
    sku_id: string;
    name: string;
    summary: string;
    store_listing_id: string;
    banner: string;
    unpublished_at: string | null;
    styles: CollectiblesCategoryStyle;
    prices: CollectiblesPriceMap;
    items: CollectiblesProductItem[];
    type: number;
    premium_type: number;
    category_sku_id: string;
    google_sku_ids: StringStringDictionary;
    variants?: CollectiblesProductVariant[];
}

export interface CollectiblesProductVariant {
    sku_id: string;
    name: string;
    name_localizations: null;
    summary: string;
    summary_localizations: null;
    store_listing_id: string;
    banner?: string;
    unpublished_at?: string | null;
    styles?: CollectiblesCategoryStyle;
    prices: CollectiblesPriceMap;
    items: CollectiblesProductItem[];
    type: number;
    premium_type: number;
    category_sku_id: string;
    google_sku_ids?: StringStringDictionary;
    base_variant_sku_id: string;
    base_variant_name: string;
    variant_label: string;
    variant_value: string; // hex string
}

export interface CollectiblesProductItem {
    type: number;
    id: string;
    sku_id: string;
    asset?: string;
    label?: string;
    palette?: string;
}

export type CollectiblesPriceMap = {
    [key: string]: { country_prices: CollectiblesCountryPrice };
};

export interface CollectiblesCountryPrice {
    country_code: string;
    prices: CollectiblesPriceEntry[];
}

export interface CollectiblesPriceEntry {
    amount: number;
    currency: string;
    exponent: number;
}
