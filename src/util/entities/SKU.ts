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

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import { Application } from "./Application";
import {
    BillingPaymentGateway,
    CreateSKUSchema,
    LocalizedStringSchema,
    SKUAccessType,
    SKUContentRatingAgency,
    SKUContentRatingSchema,
    SKUExternalSKUStrategySchema,
    SKUFeature,
    SKUGenre,
    SKUOperatingSystem,
    SKUPriceSchema,
    SKUProductLine,
    SKUSystemRequirementsSchema,
    SKUTenantMetadataSchema,
    SKUType,
} from "@spacebar/schemas";
import { SKUGuildPowerupMetadataSchema } from "../../schemas/api/store/SKUGuildPowerupMetadataSchema";
import { slugify } from "../util";

@Entity({
    name: "skus",
})
export class SKU extends BaseClass {
    @Column()
    type: SKUType;

    @Column()
    application_id: string;

    @JoinColumn({ name: "application_id" })
    @ManyToOne(() => Application, { onDelete: "CASCADE" })
    application: Application;

    @Column()
    product_line: SKUProductLine;

    @Column()
    product_id?: string;

    @Column({ type: "bigint" })
    flags: number = 0; // SKUFlags

    @Column({ type: "simple-json" })
    name: LocalizedStringSchema;

    @Column({ nullable: true, type: "simple-json" })
    summary?: LocalizedStringSchema;

    @Column({ nullable: true, type: "simple-json" })
    description?: LocalizedStringSchema;

    @Column({ nullable: true, type: "simple-json" })
    legal_notice?: LocalizedStringSchema;

    @Column()
    slug: string;

    @Column({ nullable: true })
    thumbnail_asset_id?: string;

    @Column({ nullable: true, type: "text" })
    dependent_sku_id?: string | null;

    @JoinColumn({ name: "bundled_sku_ids" })
    @OneToMany(() => SKU, (sku: SKU) => sku.id, {
        cascade: true,
        orphanedRowAction: "delete",
        onDelete: "CASCADE",
    })
    bundled_skus?: SKU[];

    @Column({ nullable: true, type: "simple-array" })
    bundled_sku_ids?: string[];

    @Column()
    access_type: SKUAccessType;

    @Column({ nullable: true, type: "simple-array" })
    manifest_labels?: string[] | null;

    @Column({ type: "simple-array" })
    features: SKUFeature[];

    @Column({ nullable: true, type: "simple-array" })
    locales?: string[];

    @Column({ nullable: true, type: "simple-array" })
    genres?: SKUGenre[];

    @Column({ nullable: true, type: "simple-array" })
    available_regions?: string[];

    @Column({ nullable: true, type: "simple-json" })
    // only for localized skus
    content_rating?: SKUContentRatingSchema;

    @Column({ nullable: true, type: "simple-json" })
    // only for localized skus
    content_rating_agency?: SKUContentRatingAgency;

    @Column({ nullable: true, type: "simple-json" })
    // only for unlocalized skus
    content_ratings?: Record<SKUContentRatingAgency, SKUContentRatingSchema>;

    @Column({ nullable: true, type: "simple-json" })
    system_requirements?: Record<SKUOperatingSystem, SKUSystemRequirementsSchema>;

    @Column({ nullable: true, type: "simple-json" })
    // used for localized skus
    price?: SKUPriceSchema | Record<string, unknown>; // discord.food says map[string, integer] but i dont think thats true, its probably SKUPriceSchema

    @Column({ nullable: true })
    // used for unlocalized skus
    price_tier?: number;

    @Column({ nullable: true })
    // used for unlocalized skus
    sale_price_tier?: number;

    @Column({ nullable: true, type: "simple-json" })
    // used for localized skus
    sale_price?: Record<string, unknown>; // same here, discord.food says map[string, integer] which i dont believe

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;

    @Column({ nullable: true, type: Date })
    release_date?: Date | null;

    @Column({ nullable: true })
    preorder_approximate_release_date?: string;

    @Column({ nullable: true })
    preorder_released_at?: string;

    @Column({ nullable: true })
    external_purchase_url?: string;

    @Column({ nullable: true, type: "simple-json" })
    external_sku_strategies?: Record<BillingPaymentGateway, SKUExternalSKUStrategySchema>;

    @Column({ nullable: true, type: "simple-array" })
    eligible_payment_gateways?: BillingPaymentGateway[];

    @Column()
    premium: boolean;

    @Column()
    show_age_gate: boolean;

    @Column({ nullable: true })
    // only for localized skus
    restricted?: boolean;

    @Column({ nullable: true })
    exclusive?: boolean;

    @Column({ nullable: true, default: false })
    deleted?: boolean = false;

    @Column({ nullable: true, type: "simple-json" })
    tenant_metadata?: SKUTenantMetadataSchema;

    @Column({ nullable: true, type: "simple-json" })
    powerup_metadata?: SKUGuildPowerupMetadataSchema;

    static async createSku(data: CreateSKUSchema): Promise<SKU> {
        const n = {
            ...data,
            bundled_skus: undefined,
            name: undefined,
            slug: undefined,
        };

        // convert string to localized string or use as is
        const name = typeof data.name === "string" ? { default: data.name } : data.name;

        const sku = await SKU.create({
            product_line: SKUProductLine.APPLICATION,
            dependent_sku_id: null,
            manifest_labels: null,
            access_type: SKUAccessType.FULL,
            features: [],
            release_date: null,
            premium: false,
            flags: 0,
            show_age_gate: false,
            tenant_metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
            ...n,
            bundled_sku_ids: data.bundled_skus,
            name,
            slug: slugify(name.default),
        });

        return sku;
    }
}
