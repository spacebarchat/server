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

import { CollectibleAssetConfigSchema, CollectibleBannerAssetSchema, CollectibleProductSchema, CollectibleStyleSchema, StringStringDictionary } from "@spacebar/schemas";

export type CollectiblesCategoriesResponse = CollectibleCategorySchema[];

export interface CollectibleCategorySchema {
    /**
     * The SKU ID of the collectible category
     */
    sku_id: string;
    /**
     * The store listing ID associated with the collectible category
     */
    store_listing_id: string;
    /**
     * The color of the banner text as a hexadecimal color string
     */
    banner_text_color?: string;
    /**
     * The catalog banner asset
     */
    catalog_banner_asset?: CollectibleAssetConfigSchema;
    /**
     * The hero banner asset
     */
    hero_banner_asset?: CollectibleAssetConfigSchema;
    /**
     * The body text for the featured block
     */
    featured_block_body?: string;
    /**
     * The URL of the featured block image
     */
    featured_block_url?: string;
    /**
     * The hero banner asset. might be legacy in favor of hero_banner_asset?
     */
    hero_banner_config_asset?: CollectibleBannerAssetSchema;
    /**
     * The display configuration for the hero banner
     */
    hero_banner_display_config?: CollectibleBannerAssetSchema;
    /**
     * The display configuration for the hero banner. might be legacy in favor of hero_banner_display_config?
     */
    hero_banner_config?: CollectibleBannerAssetSchema;
    /**
     * The title text for the hero block
     */
    hero_block_title?: string;
    /**
     * The display configuration for the hero logo
     */
    hero_logo_display_config?: CollectibleAssetConfigSchema;
    /**
     * The URL of the hero logo image
     */
    hero_logo_url?: string;
    /**
     * The popularity ranking of SKU IDs within the collectible category
     */
    hero_ranking: string[];
    /**
     * The URL of the Rive hero animation
     */
    hero_rive_url?: string;
    /**
     * The URL of the logo image
     */
    logo_url: string;
    /**
     * The URL of the mobile banner image
     */
    mobile_banner_url?: string;
    /**
     * The URL of the mobile background image
     */
    mobile_bg_url?: string;
    /**
     * The title text for the mobile hero block
     */
    mobile_hero_block_title?: string;
    /**
     * The title text for the mobile products section
     */
    mobile_products_title?: string;
    /**
     * The summary text for the mobile products section
     */
    mobile_summary: string;
    /**
     * The name of the collectible category
     */
    name: string;
    /**
     * The URL of the product display page background image
     */
    pdp_bg_url: string;
    /**
     * The list of products in the collectible category
     */
    products: CollectibleProductSchema[];
    /**
     * The colors to use in the client
     */
    styles: CollectibleStyleSchema;
    /**
     * A description of the collectible category
     */
    summary: string;
    /**
     * The time at which the collectible category should be unpublished
     */
    unpublished_at: string | null;
    /**
     * The wide banner asset config
     */
    wide_banner_asset?: CollectibleAssetConfigSchema;
    /**
     * The body text for the wide banner
     */
    wide_banner_body?: string;
    /**
     * The title text for the wide banner
     */
    wide_banner_title?: string;
    /**
     * The ID of the logo image
     */
    logo?: string | null;
    /**
     * The ID of the mobile background image
     */
    mobile_bg?: string | null;
    /**
     * The ID of the product display page background image
     */
    pdp_bg?: string | null;
    /**
     * The ID of the mobile banner image
     */
    mobile_banner?: string | null;
    featured_block?: string;
    /**
     * The ID of the hero logo image
     */
    hero_logo?: string | null;
    /**
     * The URL of the hero banner
     */
    hero_banner_url?: string | null;
    /**
     * The URL of the animated hero banner
     */
    hero_banner_animated_url?: string | null;
    /**
     * The URL of the catalog banner
     */
    catalog_banner_url?: string | null;
    /**
     * The URL of the wide banner
     */
    wide_banner_url?: string | null;
}
