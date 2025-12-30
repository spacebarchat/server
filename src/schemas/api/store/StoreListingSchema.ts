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

import { Guild, SKU } from "@spacebar/util";
import { LocalizedStringSchema } from "../../uncategorised";
import { SKUGuildPowerupMetadataSchema } from "./SKUGuildPowerupMetadataSchema";
import { StoreAssetSchema } from "./StoreAssetSchema";
import { StoreCarouselItemSchema } from "./StoreCarouselItemSchema";
import { StoreListingBenefitSchema } from "./StoreListingBenefitSchema";
import { StoreNoteSchema } from "./StoreNoteSchema";

/**
 * Store listing objects can either be localized or unlocalized. Localized listings only serialize strings and pricing for the user's location, while unlocalized listings serialize all strings and pricing for all locales. All objects serialized in the listing inherit this behavior.
 */
export interface StoreListingSchema {
    /**
     * The ID of the listing
     */
    id: string;
    /**
     * The SKU associated with the listing
     */
    sku: SKU;
    /**
     * The child SKUs associated with the category listing
     */
    child_skus?: SKU[];
    /**
     * Alternative SKUs for the listing
     */
    alternative_skus?: SKU[];
    /**
     * A summary of the listing
     */
    summary: LocalizedStringSchema;
    /**
     * A description of the listing
     */
    description?: LocalizedStringSchema;
    /**
     * A tagline for the listing
     */
    tagline?: LocalizedStringSchema | null;
    /**
     * Flavor text for the listing
     */
    flavor_text?: string | null;
    /**
     * The benefits of the listing
     */
    benefits?: StoreListingBenefitSchema[];
    /**
     * Whether the listing is published
     */
    published?: boolean;
    /**
     * The carousel items for the listing
     */
    carousel_items?: StoreCarouselItemSchema[];
    /**
     * Notes from staff about the listing
     */
    staff_notes?: StoreNoteSchema;
    /**
     * The public guild associated with the listing
     */
    guild?: Partial<Guild> | null;
    /**
     * The store assets for the listing
     */
    assets?: StoreAssetSchema[];
    /**
     * The thumbnail for the listing
     */
    thumbnail?: StoreAssetSchema;
    /**
     * The preview video for the listing
     */
    preview_video?: StoreAssetSchema;
    /**
     * The header background for the listing
     */
    header_background?: StoreAssetSchema;
    /**
     * The dark theme header logo for the listing
     */
    header_logo_dark_theme?: StoreAssetSchema;
    /**
     * The light theme header logo for the listing
     */
    header_logo_light_theme?: StoreAssetSchema;
    /**
     * The box art for the listing
     */
    box_art?: StoreAssetSchema;
    /**
     * The hero background for the listing
     */
    hero_background?: StoreAssetSchema;
    /**
     * The hero video for the listing
     */
    hero_video?: StoreAssetSchema;
    /**
     * The application branch ID granted by the listing
     */
    entitlement_branch_id?: string | null;
    /**
     * When the listing was published
     */
    published_at?: string;
    /**
     * When the listing was unpublished
     */
    unpublished_at?: string;
    /**
     * The guild powerup metadata for the listing
     */
    powerup_metadata?: Partial<SKUGuildPowerupMetadataSchema>;
}
