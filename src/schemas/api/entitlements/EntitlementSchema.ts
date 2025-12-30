/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { SKU, User } from "@spacebar/util";
import { EntitlementFulfillmentStatus } from "./EntitlementFulfillmentStatus";
import { EntitlementGiftStyle } from "./EntitlementGiftStyle";
import { EntitlementSpecialSourceType } from "./EntitlementSpecialSourceType";
import { EntitlementTenantMetadataSchema } from "./EntitlementTenantMetadataSchema";
import { EntitlementType } from "./EntitlementType";

export interface EntitlementSchema {
    id: string;
    type: EntitlementType;
    sku_id: string;
    application_id: string;
    user_id: string;
    user?: Partial<User>;
    guild_id?: string;
    parent_id?: string;
    deleted: boolean;
    consumed?: boolean;
    branches?: string[];
    starts_at: string | null;
    ends_at: string | null;
    promotion_id: string | null;
    subscription_id?: string;
    gift_code_flags: bigint; // EntitlementGiftCodeFlags;
    gift_code_batch_id?: string;
    gifter_user_id?: string;
    gift_style?: EntitlementGiftStyle;
    fulfillment_status?: EntitlementFulfillmentStatus;
    fulfilled_at?: string;
    source_type?: EntitlementSpecialSourceType;
    tenant_metadata?: Record<string, EntitlementTenantMetadataSchema>;
    sku?: SKU;
    subscription_plan?: Partial<unknown>; // TODO: https://docs.discord.food/resources/store#subscription-plan-object
}
