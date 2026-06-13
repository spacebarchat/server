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

export interface RoleResponse {
    id: Snowflake;
    name: string;
    description: string | null;
    // @deprecated
    color: number;
    colors: RoleColors;
    hoist: boolean;
    icon?: string | null;
    unicode_emoji?: string | null;
    position: number;
    // @format number
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    flags?: number;
    tags?: RoleTags; // unused currently
}

export type RoleListResponse = RoleResponse[];

export class RoleColors {
    primary_color: number;
    secondary_color: number | undefined; // only used for "holographic" and "gradient" styles
    tertiary_color?: number | undefined; // only used for "holographic" style

    toJSON(): RoleColors {
        return {
            ...this,
            secondary_color: this.secondary_color ?? undefined,
            tertiary_color: this.tertiary_color ?? undefined,
        };
    }
}

export class RoleTags {
    bot_id?: Snowflake;
    integration_id?: Snowflake;
    subscription_listing_id?: Snowflake;
    // ??? https://github.com/discord-userdoccers/discord-userdoccers/issues/576 - in other words, types are currently unknown
    premium_subscriber?: boolean | null;
    available_for_purchase?: boolean | null;
    guild_connections?: boolean | null;

    toJSON(): RoleTags {
        return {
            ...this,
            // "forward compatibility"
            premium_subscriber: this.premium_subscriber ? null : undefined,
            available_for_purchase: this.available_for_purchase ? null : undefined,
            guild_connections: this.subscription_listing_id ? null : undefined,
        };
    }
}
