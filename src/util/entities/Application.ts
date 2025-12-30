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

import { Column, Entity, JoinColumn, ManyToOne, OneToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Team } from "./Team";
import { User } from "./User";
import { Guild } from "./Guild";
import {
    ApplicationApprovableConsoleType,
    ApplicationCompanySchema,
    ApplicationDiscoverabilityState,
    ApplicationEventWebhooksStatus,
    ApplicationEventWebhooksType,
    ApplicationExecutableSchema,
    ApplicationGuildRestriction,
    ApplicationIntegrationTypeConfigurationSchema,
    ApplicationInteractionsVersion,
    ApplicationMonetizationState,
    ApplicationSKUSchema,
    ApplicationVerificationState,
    RPCApplicationState,
    StoreApplicationState,
} from "@spacebar/schemas";

@Entity({
    name: "applications",
})
export class Application extends BaseClass {
    @Column()
    name: string;

    @Column({ nullable: true })
    icon?: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    summary: string = "";

    @Column({ type: "simple-json", nullable: true })
    type?: object; // TODO: this type is bad

    @Column()
    hook: boolean = true;

    @Column()
    // deprecated
    bot_public?: boolean = true;

    @Column()
    // deprecated
    bot_require_code_grant?: boolean = false;

    @Column()
    verify_key: string;

    @JoinColumn({ name: "owner_id" })
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    owner: User;

    @Column()
    // ApplicationFlags bitfield
    flags: number = 0;

    @Column({ type: "simple-array", nullable: true })
    redirect_uris: string[] = [];

    @Column()
    rpc_application_state: RPCApplicationState = RPCApplicationState.DISABLED;

    @Column()
    store_application_state: StoreApplicationState = StoreApplicationState.NONE;

    @Column()
    verification_state: ApplicationVerificationState = ApplicationVerificationState.INELIGIBLE;

    @Column({ nullable: true })
    interactions_endpoint_url?: string;

    @Column({ nullable: true })
    integration_public: boolean = true;

    @Column({ nullable: true })
    integration_require_code_grant: boolean = false;

    @Column({ nullable: true })
    discoverability_state: ApplicationDiscoverabilityState = ApplicationDiscoverabilityState.INELIGIBLE;

    @Column({ nullable: true })
    discovery_eligibility_flags: number = 0; // ApplicationDiscoveryEligibilityFlags bitfield

    @JoinColumn({ name: "bot_user_id" })
    @OneToOne(() => User, { onDelete: "CASCADE" })
    bot?: User;

    @Column({ type: "simple-array", nullable: true })
    tags?: string[];

    @Column({ nullable: true })
    cover_image?: string; // the application's default rich presence invite cover image hash

    @Column({ type: "simple-json", nullable: true })
    install_params?: { scopes: string[]; permissions: string };

    @Column({ nullable: true })
    terms_of_service_url?: string;

    @Column({ nullable: true })
    privacy_policy_url?: string;

    @Column({ nullable: true })
    @RelationId((application: Application) => application.guild)
    guild_id?: string;

    @JoinColumn({ name: "guild_id" })
    @ManyToOne(() => Guild)
    guild?: Guild; // guild to which the app is linked, e.g. a developer support server

    @Column({ nullable: true })
    custom_install_url?: string;

    @Column({ nullable: true })
    splash?: string;

    @Column({ nullable: true })
    primary_sku_id?: string; // if this application is a game sold, this field will be the id of the "Game SKU" that is created,

    @Column({ nullable: true })
    eula_id?: string;

    @Column({ nullable: true })
    slug?: string; // if this application is a game sold, this field will be the URL slug that links to the store page

    @Column({ type: "simple-array", nullable: true })
    aliases?: string[];

    @Column({ type: "simple-json", nullable: true })
    executables?: ApplicationExecutableSchema[];

    @Column({ type: "simple-json", nullable: true })
    third_party_skus?: ApplicationSKUSchema[];

    @Column({ nullable: true })
    overlay?: boolean = false;

    @Column({ nullable: true })
    overlay_methods?: number; // only one right now is 1 << 0	OUT_OF_PROCESS

    @Column({ nullable: true })
    overlay_warn?: boolean = false;

    @Column({ nullable: true })
    overlay_compatibility_hook?: boolean = false;

    @Column({ type: "simple-json", nullable: true })
    developers?: ApplicationCompanySchema[];

    @Column({ type: "simple-json", nullable: true })
    publishers?: ApplicationCompanySchema[];

    @Column({ type: "simple-array", nullable: true })
    rpc_origins?: string[];

    @Column({ nullable: true })
    deeplink_uri?: string;

    @Column({ nullable: true })
    bot_disabled?: boolean = false;

    @Column({ nullable: true })
    bot_quarantined?: boolean = false;

    @Column({ nullable: true })
    bot_approximate_guild_count?: number;

    @Column({ nullable: true })
    approximate_guild_count?: number;

    @Column({ nullable: true })
    approximate_user_install_count?: number;

    @Column({ nullable: true })
    approximate_user_authorization_count?: number;

    @Column({ nullable: true })
    internal_guild_restriction?: ApplicationGuildRestriction;

    @Column({ nullable: true, type: "text" })
    role_connections_verification_url: string | null = null;

    @Column()
    interactions_version: ApplicationInteractionsVersion = ApplicationInteractionsVersion.VERSION_1;

    @Column({ type: "simple-array" })
    interactions_event_types: ApplicationEventWebhooksType[] = [];

    @Column({ nullable: true })
    event_webhooks_status?: ApplicationEventWebhooksStatus;

    @Column({ nullable: true })
    event_webhooks_url?: string;

    @Column({ type: "simple-array", nullable: true })
    event_webhooks_types?: ApplicationEventWebhooksType[];

    @Column()
    explicit_content_filter: number = 0; // Inherits the guild's explicit content filter

    @Column({ type: "simple-json", nullable: true })
    integration_types_config?: Record<number, ApplicationIntegrationTypeConfigurationSchema>;

    @Column({ nullable: true })
    connection_entrypoint_url?: string;

    @Column()
    is_verified: boolean = false;

    @Column()
    creator_monetization_state: number = 0; // unknown values

    @Column()
    is_discoverable: boolean = false;

    @Column()
    is_monetized: boolean = false;

    @Column()
    storefront_available: boolean = false;

    @Column()
    monetization_state: ApplicationMonetizationState = ApplicationMonetizationState.NONE;

    @Column({ nullable: true })
    monetization_eligibility_flags?: number = 0; // ApplicationMonetizationEligibilityFlags

    @Column({ nullable: true })
    max_participants?: number; // max participants for embedded applications, -1 for unlimited

    @Column({ type: "simple-json", nullable: true })
    embedded_activity_config?: object; // dont feel like making types for this rn

    @Column({ type: "simple-array" })
    approved_consoles: ApplicationApprovableConsoleType[] = [];

    // @Column()
    // pricing_localization_strategy: string;

    @JoinColumn({ name: "team_id" })
    @ManyToOne(() => Team, {
        onDelete: "CASCADE",
        nullable: true,
    })
    team?: Team;
}
