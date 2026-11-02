/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { ApplicationSku, PartialUser, Snowflake, Team } from "@spacebar/schemas";

export interface ApplicationCommand {
    id: string;
    application_id: string;
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOption {
    type: ApplicationCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: ApplicationCommandOptionChoice[];
    options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOptionChoice {
    name: string;
    value: string | number;
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
}

export interface ApplicationCommandInteractionData {
    id: string;
    name: string;
    options?: ApplicationCommandInteractionDataOption[];
}

export interface ApplicationCommandInteractionDataOption {
    name: string;
    value?: unknown;
    options?: ApplicationCommandInteractionDataOption[];
}

export interface Application {
    id: Snowflake;
    name: string;
    description: string;
    icon: string | null;
    cover_image?: string;
    splash?: string;
    type: ApplicationType | null;
    flags: number; // ApplicationFlags
    flags_new: string; // ApplicationFlags
    primary_sku_id?: Snowflake;
    verify_key: string;
    guild_id?: Snowflake;
    eula_id?: Snowflake;
    slug?: string;
    aliases?: string[];
    executables?: ApplicationExecutable[];
    third_party_skus?: ApplicationSku[];
    hook: boolean;
    overlay?: boolean;
    overlay_methods?: number; // OverlayMethodFlags
    overlay_warn?: boolean;
    overlay_compatibility_hook?: boolean;
    bot?: PartialUser;
    owner: PartialUser;
    team?: Team | null;
    developers?: Company[];
    publishers?: Company[];
    rpc_origins?: string[];
    redirect_uris: string[];
    deeplink_uri?: string;
    integration_public: boolean;
    integration_require_code_grant: boolean;
    bot_public?: boolean;
    bot_require_code_grant?: boolean;
    bot_disabled?: boolean;
    bot_quarantined?: boolean;
    bot_approximate_guild_count?: number;
    approximate_guild_count?: number;
    approximate_user_install_count: number;
    approximate_user_authorization_count: number;
    internal_guild_restriction: InternalGuildRestriction;
    terms_of_service_url?: string;
    privacy_policy_url?: string;
    role_connections_verification_url: string | null;
    interactions_endpoint_url: string;
    interactions_version: number;
    interactions_event_types: string[];
    event_webhooks_status?: EventWebhooksStatus;
    event_webhooks_url?: string;
    event_webhooks_types?: string[];
    explicit_content_filter: number;
    tags?: string[];
    install_params?: ApplicationInstallParams;
    custom_install_url?: string;
    integration_types_config?: Record<number, ApplicationIntegrationTypeConfiguration | null>;
    connection_entrypoint_url?: string;
    is_verified: boolean;
    verification_state: ApplicationVerificationState;
    store_application_state: StoreApplicationState;
    rpc_application_state: RpcApplicationState;
    creator_monetization_state: number; // unknown enum
    is_discoverable: boolean;
    discoverability_state: ApplicationDiscoverabilityState;
    discovery_eligibility_flags: number; // ApplicationDiscoveryEligibilityFlags
    is_monetized: boolean;
    storefront_available: boolean;
    monetization_state: ApplicationMonetizationState;
    monetization_eligibility_flags?: number; // ApplicationMonetizationEligibilityFlags
    max_participants?: number;
    embedded_activity_config?: EmbeddedActivityConfig;
    approved_consoles: ApprovableConsoleType[];
    pricing_localization_strategy: string;
}

export enum ApplicationType {
    DEPRECATED_GAME = 1,
    TICKETED_EVENTS = 3,
    CREATOR_MONETIZATION = 4,
    GAME = 5,
}
const OverlayMethodFlags = {
    OUT_OF_PROCESS: 1n << 0n,
} as const;

export enum InternalGuildRestriction {
    JOIN_ALL = 1,
    JOIN_EXTERNAL_ONLY = 2,
    JOIN_INTERNAL_ONLY = 3,
}
export enum EventWebhooksStatus {
    DISABLED = 1,
    ENABLED = 2,
}

export enum ApplicationVerificationState {
    INELIGIBLE = 1,
    UNSUBMITTED = 2,
    SUBMITTED = 3,
    APPROVED_MANUALLY = 4,
    BLOCKED = 5,
    APPROVED_AUTOMATICALLY = 6,
}

export enum StoreApplicationState {
    NONE = 1,
    PAID = 2,
    SUBMITTED = 3,
    APPROVED = 4,
    REJECTED = 5,
}

export enum RpcApplicationState {
    DISABLED = 0,
    UNSUBMITTED = 1,
    SUBMITTED = 2,
    APPROVED = 3,
    REJECTED = 4,
}

export enum ApplicationDiscoverabilityState {
    INELIGIBLE = 1,
    NOT_DISCOVERABLE = 2,
    DISCOVERABLE = 3,
    FEATUREABLE = 4,
    BLOCKED = 5,
}

const ApplicationDiscoveryEligibilityFlags = {
    VERIFIED: 1n << 0n,
    TAG: 1n << 1n,
    DESCRIPTION: 1n << 2n,
    TERMS_OF_SERVICE: 1n << 3n,
    PRIVACY_POLICY: 1n << 4n,
    INSTALL_PARAMS: 1n << 5n,
    SAFE_NAME: 1n << 6n,
    SAFE_DESCRIPTION: 1n << 7n,
    APPROVED_COMMANDS: 1n << 8n,
    SUPPORT_GUILD: 1n << 9n,
    SAFE_COMMANDS: 1n << 10n,
    MFA: 1n << 11n,
    SAFE_DIRECTORY_OVERVIEW: 1n << 12n,
    SUPPORTED_LOCALES: 1n << 13n,
    SAFE_SHORT_DESCRIPTION: 1n << 14n,
    SAFE_ROLE_CONNECTIONS: 1n << 15n,
} as const;

export enum ApplicationMonetizationState {
    NONE = 1,
    ENABLED = 2,
    BLOCKED = 3,
}

const ApplicationMonetizationEligibilityFlags = {
    VERIFIED: 1n << 0n,
    HAS_TEAM: 1n << 1n,
    APPROVED_COMMANDS: 1n << 2n,
    TERMS_OF_SERVICE: 1n << 3n,
    PRIVACY_POLICY: 1n << 4n,
    SAFE_NAME: 1n << 5n,
    SAFE_DESCRIPTION: 1n << 6n,
    SAFE_ROLE_CONNECTIONS: 1n << 7n,
    USER_IS_TEAM_OWNER: 1n << 8n,
    NOT_QUARANTINED: 1n << 9n,
    USER_LOCALE_SUPPORTED: 1n << 10n,
    USER_AGE_SUPPORTED: 1n << 11n,
    USER_DATE_OF_BIRTH_DEFINED: 1n << 12n,
    USER_MFA_ENABLED: 1n << 13n,
    USER_EMAIL_VERIFIED: 1n << 14n,
    TEAM_MEMBERS_EMAIL_VERIFIED: 1n << 15n,
    TEAM_MEMBERS_MFA_ENABLED: 1n << 16n,
    NO_BLOCKING_ISSUES: 1n << 17n,
    VALID_PAYOUT_STATUS: 1n << 18n,
} as const;

export enum ApprovableConsoleType {
    XBOX = 1,
    PLAYSTATION_5 = 2,
    PLAYSTATION_4 = 3,
}

const ApplicationFlags = {
    EMBEDDED_RELEASED: 1n << 1n,
    MANAGED_EMOJI: 1n << 2n,
    EMBEDDED_IAP: 1n << 3n,
    GROUP_DM_CREATE: 1n << 4n,
    RPC_PRIVATE_BETA: 1n << 5n,
    AUTO_MODERATION_RULE_CREATE_BADGE: 1n << 6n,
    GAME_PROFILE_DISABLED: 1n << 7n,
    PUBLIC_OAUTH2_CLIENT: 1n << 8n,
    CONTEXTLESS_ACTIVITY: 1n << 9n,
    SOCIAL_LAYER_INTEGRATION_LIMITED: 1n << 10n,
    CLOUD_GAMING_DEMO: 1n << 11n,
    GATEWAY_PRESENCE: 1n << 12n,
    GATEWAY_PRESENCE_LIMITED: 1n << 13n,
    GATEWAY_GUILD_MEMBERS: 1n << 14n,
    GATEWAY_GUILD_MEMBERS_LIMITED: 1n << 15n,
    VERIFICATION_PENDING_GUILD_LIMIT: 1n << 16n,
    EMBEDDED: 1n << 17n,
    GATEWAY_MESSAGE_CONTENT: 1n << 18n,
    GATEWAY_MESSAGE_CONTENT_LIMITED: 1n << 19n,
    EMBEDDED_FIRST_PARTY: 1n << 20n,
    APPLICATION_COMMAND_MIGRATED: 1n << 21n,
    APPLICATION_COMMAND_BADGE: 1n << 23n,
    ACTIVE: 1n << 24n,
    ACTIVE_GRACE_PERIOD: 1n << 25n,
    IFRAME_MODAL: 1n << 26n,
    SOCIAL_LAYER_INTEGRATION: 1n << 27n,
    PROMOTED: 1n << 29n,
    PARTNER: 1n << 30n,
    PARENT: 1n << 33n,
    DISABLE_RELATIONSHIP_ACCESS: 1n << 34n,
    STOREFRONT_ELIGIBLE: 1n << 35n,
} as const;

export interface ApplicationExecutable {
    os: string;
    name: string;
    is_launcher: boolean;
}

export interface Company {
    id: Snowflake;
    name: string;
}

export interface ApplicationInstallParams {
    scopes: string[];
    permissions: string;
}

export interface ApplicationIntegrationTypeConfiguration {
    oauth2_install_params?: ApplicationInstallParams;
}

export interface EmbeddedActivityConfig {
    application_id?: Snowflake;
    activity_preview_video_asset_id: Snowflake | null;
    supported_platforms: string[];
    default_orientation_lock_state: EmbeddedActivityOrientationLockStateType;
    tablet_default_orientation_lock_state: EmbeddedActivityOrientationLockStateType;
    requires_age_gate: boolean;
    legacy_responsive_aspect_ratio: boolean;
    premium_tier_requirement: number | null;
    free_period_starts_at: string | null;
    free_period_ends_at: string | null;
    client_platform_config: Record<string, EmbeddedActivityPlatformConfig>;
    shelf_rank: number;
    has_csp_exception: boolean;
    displays_advertisements: boolean;
    supported_locales: string[];
    blocked_locales: string[];
}

export enum EmbeddedActivityOrientationLockStateType {
    UNLOCKED = 1,
    PORTRAIT = 2,
    LANDSCAPE = 3,
}

export interface EmbeddedActivityPlatformConfig {
    label_type: EmbeddedActivityPlatformConfigLabelType;
    label_until?: string | null;
    release_phase: EmbeddedActivityReleasePhase;
    omit_badge_from_surfaces: string[];
}

export enum EmbeddedActivityPlatformConfigLabelType {
    NONE = 0,
    NEW = 1,
    UPDATED = 2,
}

export enum EmbeddedActivityReleasePhase {
    IN_DEVELOPMENT = "in_development",
    ACTIVITIES_TEAM = "activities_team",
    EMPLOYEE_RELEASE = "employee_release",
    SOFT_LAUNCH = "soft_launch",
    SOFT_LAUNCH_MULTI_GEO = "soft_launch_multi_geo",
    GLOBAL_LAUNCH = "global_launch",
}

export type ApplicationAllowlistResponse = AllowlistedUser[];
export interface AllowlistedUser {
    user: PartialUser;
    state: ApplicationMembershipState;
}
export enum ApplicationMembershipState {
    INVITED = 1,
    ACCEPTED = 2,
}
export interface AllowlistAddRequestSchema {
    username: string;
    discriminator?: string | null;
}
export interface AllowlistAcceptSchema {
    token: string;
}
