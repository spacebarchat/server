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

export enum ShopSubBlockType {
    /**
     * A category subblock
     *
     * Value: 0
     * Name: CATEGORY
     */
    CATEGORY = 0,
}

export interface SubBlockSchema {
    /**
     * The subblock type
     */
    type: ShopSubBlockType;
    /**
     * The collectible category store listing ID
     */
    category_store_listing_id: string;
    /**
     * The URL of the shop block asset
     */
    asset_url: string;
    /**
     * The hex color code of the banner text
     */
    banner_text_color: string | null;
    /**
     * The URL of the banner image
     */
    banner_url: string;
    /**
     * The body text of the shop block
     */
    body_text: string | null;
    /**
     * The name of the shop block
     */
    name: string;
    /**
     * When the collectible category should be unpublished
     */
    unpublished_at: string | null;
}
