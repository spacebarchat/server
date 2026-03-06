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

import { ApplicationCommandOption, Snowflake, StringStringDictionary } from "@spacebar/schemas";

export interface ApplicationCommandSchema {
    id?: Snowflake;
    type?: ApplicationCommandType;
    application_id: Snowflake;
    guild_id?: Snowflake;
    name: string;
    name_localizations?: StringStringDictionary;
    name_localized?: string | null;
    description: string;
    description_localizations?: StringStringDictionary;
    description_localized?: string | null;
    options?: ApplicationCommandOption[];
    default_member_permissions: string | null;
    /*
     * @deprecated
     */
    dm_permission?: boolean;
    permissions?: ApplicationCommandIndexPermissions;
    nsfw?: boolean;
    integration_types?: ApplicationIntegrationType[];
    global_popularity_rank?: number;
    contexts?: InteractionContextType[];
    version: Snowflake;
    handler?: ApplicationCommandHandlerType;
}

export interface ApplicationCommandIndexPermissions {
    user?: boolean;
    roles?: Record<Snowflake, boolean>;
    channels?: Record<Snowflake, boolean>;
}

export enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3,
    PRIMARY_ENTRY_POINT = 4,
}

export enum ApplicationCommandHandlerType {
    APP_HANDLER = 1,
    DISCORD_LAUNCH_ACTIVITY = 2,
    APP_HANDLER_LAUNCH_ACTIVITY = 3,
}

export enum InteractionContextType {
    GUILD = 0,
    BOT_DM = 1,
    PRIVATE_CHANNEL = 2,
}

export enum ApplicationIntegrationType {
    GUILD_INSTALL = 0,
    USER_INSTALL = 1,
}
