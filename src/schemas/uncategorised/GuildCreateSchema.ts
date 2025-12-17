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

import { ChannelModifySchema } from "@spacebar/schemas";

export interface GuildCreateSchema {
    /**
     * @maxLength 100
     */
    name?: string;
    region?: string;
    icon?: string | null;
    channels?: ChannelModifySchema[];
    system_channel_id?: string;
    rules_channel_id?: string;
    guild_template_code?: string;
    staff_only?: boolean;
}
