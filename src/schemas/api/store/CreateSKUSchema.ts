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

import { LocalizedStringSchema } from "../../uncategorised";
import { SKUAccessType } from "./SKUAccessType";
import { SKUContentRatingSchema } from "./SKUContentRatingSchema";
import { SKUFeature } from "./SKUFeature";
import { SKUGenre } from "./SKUGenre";
import { SKUSystemRequirementsSchema } from "./SKUSystemRequirementsSchema";
import { SKUType } from "./SKUType";

export interface CreateSKUSchema {
    /**
     * The type of SKU
     */
    type: SKUType;
    /**
     * The ID of the application the SKU belongs to
     */
    application_id: string;
    /**
     * The name of the SKU (1-256 characters)
     */
    name: LocalizedStringSchema | string;
    /**
     * The SKU flags (only AVAILABLE can be set)
     * SKUFlags bitfield
     */
    flags?: number;
    /**
     * The legal notice for the SKU (max 1024 characters)
     */
    legal_notice?: LocalizedStringSchema;
    /**
     * The ID of the prerequisite required to buy this SKU
     */
    dependent_sku_id?: string;
    /**
     * The IDs of the SKUs that are included when purchasing this SKU
     */
    bundled_skus?: string[];
    /**
     * The access level of the SKU
     */
    access_type?: SKUAccessType;
    /**
     * The IDs of the manifest labels associated with the SKU
     */
    manifest_labels?: string[];
    /**
     * The features of the SKU
     */
    features?: SKUFeature[];
    /**
     * The locales the SKU is available in
     */
    locales?: string[];
    /**
     * The genres of the SKU
     */
    genres?: SKUGenre[];
    /**
     * The content ratings of the SKU per agency
     */
    content_ratings?: { [agency: string]: SKUContentRatingSchema };
    /**
     * The system requirements for each operating system the SKU supports
     */
    system_requirements?: { [os: string]: SKUSystemRequirementsSchema };
    /**
     * The base price of the SKU
     */
    price_tier?: number;
    /**
     * Localized pricing overrides per lower-cased ISO 4217 currency code
     */
    price?: { [currency: string]: number };
    /**
     * The sale price of the SKU
     */
    sale_price_tier?: number;
    /**
     * Localized sale pricing overrides per lower-cased ISO 4217 currency code
     */
    sale_price?: { [currency: string]: number };
    /**
     * When the SKU will be released
     */
    release_date?: string;
}
