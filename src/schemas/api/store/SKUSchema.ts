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

import { BillingPaymentGateway, LocalizedStringSchema } from "@spacebar/schemas";
import { Application } from "@spacebar/util";
import { SKUAccessType } from "./SKUAccessType";
import { SKUContentRatingAgency } from "./SKUContentRatingAgency";
import { SKUContentRatingSchema } from "./SKUContentRatingSchema";
import { SKUExternalSKUStrategySchema } from "./SKUExternalSKUStrategySchema";
import { SKUFeature } from "./SKUFeature";
import { SKUGenre } from "./SKUGenre";
import { SKUGuildPowerupMetadataSchema } from "./SKUGuildPowerupMetadataSchema";
import { SKUOperatingSystem } from "./SKUOperatingSystem";
import { SKUPriceSchema } from "./SKUPriceSchema";
import { SKUProductLine } from "./SKUProductLine";
import { SKUSystemRequirementsSchema } from "./SKUSystemRequirementsSchema";
import { SKUTenantMetadataSchema } from "./SKUTenantMetadataSchema";
import { SKUType } from "./SKUType";

export interface SKUSchema {
    id: string;
    type: SKUType;
    application_id: string;
    application?: Partial<Application>;
    product_line: SKUProductLine | null;
    product_id?: string;
    flags: bigint; // SKUFlags
    name: LocalizedStringSchema;
    summary?: LocalizedStringSchema;
    description?: LocalizedStringSchema;
    legal_notice?: LocalizedStringSchema;
    slug: string;
    thumbnail_asset_id?: string;
    dependent_sku_id?: string | null;
    bundled_skus?: SKUSchema[];
    bundled_sku_ids?: string[];
    access_type: SKUAccessType;
    manifest_labels?: string[] | null;
    features: SKUFeature[];
    locales?: string[];
    genres?: SKUGenre[];
    available_regions?: string[];
    content_rating?: SKUContentRatingSchema;
    content_rating_agency?: SKUContentRatingAgency;
    content_ratings?: Record<SKUContentRatingAgency, SKUContentRatingSchema>;
    system_requirements?: Record<SKUOperatingSystem, SKUSystemRequirementsSchema>;
    price?: SKUPriceSchema | Record<string, unknown>; // discord.food says map[string, integer] but i dont think thats true, its probably SKUPriceSchema
    sale_price_tier?: number;
    sale_price?: Record<string, unknown>; // same here, discord.food says map[string, integer] which i dont believe
    created_at: string;
    updated_at: string;
    release_date?: string;
    preorder_approximate_release_date?: string;
    preorder_released_at?: string;
    external_purchase_url?: string;
    external_sku_strategies?: Record<BillingPaymentGateway, SKUExternalSKUStrategySchema>;
    eligible_payment_gateways?: BillingPaymentGateway[];
    premium: boolean;
    show_age_gate: boolean;
    restricted?: boolean;
    exclusive?: boolean;
    deleted?: boolean;
    tenant_metadata?: SKUTenantMetadataSchema;
    powerup_metadata?: SKUGuildPowerupMetadataSchema;
}
