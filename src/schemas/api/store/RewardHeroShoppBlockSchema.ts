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
import { CollectibleAssetConfigSchema } from "./CollectibleAssetConfigSchema";
import { CollectibleBannerAssetSchema } from "./CollectibleBannerAssetSchema";
import { ShopBlockType } from "./ShopBlockType";

export interface RewardHeroShopBlockSchema {
    /**
     * The shop block type
     */
    type: ShopBlockType;
    /**
     * The collectible category SKU ID
     */
    category_sku_id?: string;
    /**
     * The collectible category store listing ID
     */
    category_store_listing_id: string;
    /**
     * The name of the shop block
     */
    name: string;
    /**
     * A description of the collectible category
     */
    summary: string;
    /**
     * The banner asset
     */
    banner_asset: CollectibleAssetConfigSchema;
    /**
     * The URL of the hero logo image
     */
    logo_url: string;
    /**
     * The title of the reward hero shop block
     */
    title: string;
    /**
     * The hex color code for the banner text
     */
    banner_text_color?: string;
    /**
     * The display configuration
     */
    banner_display_config: CollectibleBannerAssetSchema;
    /**
     * The URL of the hero Rive animation
     */
    hero_rive_url?: string;
    /**
     * The shop block logo display config
     */
    logo_display_config: CollectibleBannerAssetSchema;
    /**
     * The title to be displayed on mobile devices
     */
    mobile_title?: string;
    /**
     * The summary to be displayed on mobile devices
     */
    mobile_summary?: string;
    /**
     * The products title to be displayed on mobile devices
     */
    mobile_products_title?: string;
    /**
     * The URL of the hero banner image
     */
    hero_banner_url: string;
    /**
     * The URL of the hero animated banner image
     */
    hero_banner_animated_url: string;
    /**
     * The URL of the hero logo image
     */
    hero_logo_url: string;
    /**
     * The URL of the mobile hero banner image
     */
    mobile_hero_url?: string;
    /**
     * The URL of the mobile animated hero banner image
     */
    mobile_hero_animated_url?: string;
    /**
     * The SKU IDs ranked by popularity in the collectible category
     */
    ranked_sku_ids: string[];
    /**
     * When the collectible category should be unpublished
     */
    unpublished_at: string | null;
    /**
     * The SKU ID of the reward collectible
     */
    reward_sku_id: string;
}
