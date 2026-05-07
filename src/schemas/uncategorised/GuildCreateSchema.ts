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

import { ChannelCreateSchema, RoleModifySchema } from "@spacebar/schemas";

export interface GuildCreateRoleSchema extends RoleModifySchema {
    id?: string;
    managed?: boolean;
    flags?: number;
}

export interface GuildCreateSchema {
    /**
     * @maxLength 100
     */
    name?: string;
    region?: string;
    icon?: string | null;
    verification_level?: number | null;
    default_message_notifications?: number | null;
    explicit_content_filter?: number | null;
    afk_channel_id?: string | null;
    afk_timeout?: number;
    system_channel_flags?: number;
    channels?: ChannelCreateSchema[];
    roles?: GuildCreateRoleSchema[];
    system_channel_id?: string | null;
    rules_channel_id?: string | null;
    guild_template_code?: string;
    staff_only?: boolean;
}
