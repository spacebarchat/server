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

export interface ImmersiveBannerShopBlockSchema {
    /**
     * The shop block type
     */
    type: ShopBlockType;
    /**
     * The title of the immersive banner
     */
    title: string;
    /**
     * The body text of the immersive banner
     */
    body: string;
    /**
     * The URL to the help center article
     */
    help_center_url: string;
    /**
     * The hex color code of the text
     */
    text_color: string;
    /**
     * The end time of the immersive banner
     */
    end_time: string | null;
    /**
     * The banner asset
     */
    banner_asset: CollectibleAssetConfigSchema;
}
