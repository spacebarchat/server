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

import { PublicMember, PublicMessage, PublicUser, Snowflake } from "@spacebar/schemas";
import { Channel, InteractionType } from "@spacebar/util";

export interface InteractionCreateSchema {
    version: number; // TODO: types?
    id: Snowflake;
    application_id: Snowflake;
    type: InteractionType;
    token: string;
    data?: object; // TODO: types?
    guild?: InteractionGuild;
    guild_id?: Snowflake;
    guild_locale?: string;
    channel?: Channel;
    channel_id?: Snowflake;
    member?: PublicMember;
    user?: PublicUser;
    locale?: string;
    message?: PublicMessage;
    app_permissions: string;
    entitlements?: object[]; // TODO: types?
    entitlement_sku_ids?: Snowflake[]; // DEPRECATED
    authorizing_integration_owners?: Record<number, Snowflake>; // TODO: types?
    context?: number;
    attachment_size_limit: number;
}

interface InteractionGuild {
    id: Snowflake;
    features: string[];
    locale: string;
}
