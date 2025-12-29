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

import { AnyCollectibleItem } from "./CollectibleItemSchema";
import { CollectibleItemType } from "./CollectibleItemType";
import { CollectibleStyleSchema } from "./CollectibleStyleSchema";
import { SubscriptionPricesSchema } from "./SubscriptionPricesSchema";

export interface CollectibleProductSchema {
    /**
     * The SKU ID of the collectible product
     */
    sku_id: string;
    /**
     * The store listing ID associated with the collectible product
     */
    store_listing_id: string;
    /**
     * The type of collectible
     */
    type: CollectibleItemType;
    /**
     * The bundled products included in the collectible product
     */
    bundled_products?: CollectibleProductSchema[];
    /**
     * The category SKU ID of the collectible product
     */
    category_sku_id: string;
    /**
     * The Google SKU IDs for the collectible per purchase type
     */
    google_sku_ids?: Record<number, string>;
    /**
     * The items included in the collectible product
     */
    items: AnyCollectibleItem[];
    /**
     * The name of the collectible product
     */
    name: string;
    /**
     * The premium type required to purchase the collectible product
     */
    premium_type: number;
    /**
     * The prices for the collectible per purchase type
     */
    prices?: Record<number, SubscriptionPricesSchema>;
    /**
     * The colors to use in the client
     */
    styles: CollectibleStyleSchema;
    /**
     * A description of the collectible product
     */
    summary: string;
    /**
     * When the collectible product should be unpublished
     */
    unpublished_at: string | null;
    /**
     * The name of the base variant of the collectible product
     */
    base_variant_name?: string;
    /**
     * The SKU ID of the base variant of the collectible product
     */
    base_variant_sku_id?: string;
    /**
     * When the collectible product expires
     */
    expires_at?: string | null;
    /**
     * The purchase type of the collectible product
     */
    purchase_type?: number;
    /**
     * When the collectible product was purchased
     */
    purchased_at?: string;
    /**
     * The label for the variant of the collectible product
     */
    variant_label?: string;
    /**
     * The hex value of the color for the variant of the collectible product
     */
    variant_value?: string;
    /**
     * The variants of the collectible product
     */
    variants?: CollectibleProductSchema[];
}
