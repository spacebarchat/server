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

import { Snowflake } from "../../Identifiers";
import { PartialUser } from "@spacebar/schemas";

export interface Integration {
    id: Snowflake;
    name: string;
    type: IntegrationType;
    enabled: boolean;
    account: IntegrationAccount;
    syncing?: boolean;
    role_id?: Snowflake | null; // twitch/yt
    enable_emoticons?: boolean; // twitch/yt
    expire_behavior?: number; // twitch/yt
    expire_grace_period?: number; // twitch/yt
    synced_at?: string; // twitch/yt
    subscriber_count?: number; // twitch/yt
    revoked?: boolean; // twitch/yt
    application?: IntegrationApplication; // bots
    scopes?: string[]; // bots
    role_connections_metadata: ApplicationRoleConnectionMetadata[]; //bots
    user?: PartialUser;
}

export enum IntegrationType {
    TWITCH = "twitch",
    YOUTUBE = "youtube",
    DISCORD = "discord",
    GUILD_SUBSCRIPTION = "guild_subscription",
}

export enum IntegrationExpireBehavior {
    REMOVE_ROLE = 0,
    KICK = 1,
}

export interface IntegrationAccount {
    id: string;
    name: string;
}

export interface IntegrationApplication {
    id: Snowflake;
    name: string;
    description: string;
    icon: string | null;
    cover_image?: string;
    splash?: string;
    type: number | null;
    primary_sku_id?: Snowflake;
    bot?: PartialUser;
    deeplink_uri?: string | null;
    third_party_skus?: ApplicationSku[];
    role_connections_verification_url?: string | null;
    connection_entrypoint_url?: string;
    is_verified: boolean;
    is_discoverable: boolean;
    is_monetized: boolean;
    parent_id?: Snowflake;
}

export interface ApplicationRoleConnectionMetadata {
    type: number;
    key: string;
    name: string;
    name_localizations?: Record<string, string>;
    description: string;
    description_localizations?: Record<string, string>;
}

export interface ApplicationSku {
    id: string | null;
    sku: string | null;
    distributor: string;
}
