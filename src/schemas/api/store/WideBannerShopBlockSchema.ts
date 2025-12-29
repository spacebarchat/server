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
import { ShopBlockType } from "./ShopBlockType";

export interface WideBannerShopBlockSchema {
    /**
     * The shop block type
     */
    type: ShopBlockType;
    /**
     * The collectible category store listing ID
     */
    category_store_listing_id: string;
    /**
     * The banner asset
     */
    banner_asset: CollectibleAssetConfigSchema;
    /**
     * The URL of the wide banner logo image
     */
    logo_url: string;
    /**
     * The title of the wide banner
     */
    title: string;
    /**
     * The body text of the wide banner
     */
    body: string;
    /**
     * The hex color code of the banner text
     */
    banner_text_color: string | null;
    /**
     * Whether to disable the CTA for the wide banner
     */
    disable_cta: boolean;
    /**
     * The CTA text for the wide banner
     */
    cta_text: string;
    /**
     * The CTA route for the wide banner
     */
    cta_route: string;
    /**
     * Whether the wide banner is dismissible
     */
    is_dismissible: boolean;
    /**
     * The version of the dismissible content
     */
    dismissible_content_version: number;
    /**
     * The URL of the wide banner image
     */
    wide_banner_url: string;
    /**
     * The URL of the animated wide banner image
     */
    wide_banner_animated_url?: string;
}
