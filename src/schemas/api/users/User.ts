/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { Snowflake } from "@spacebar/schemas";

export interface PartialUser {
	id: Snowflake;
	username: string;
	discriminator: string;
	global_name?: string | null;
	avatar: string | null;
	avatar_decoration_data?: AvatarDecorationData | null;
	collectibles?: Collectibles | null;
	display_name_styles?: DisplayNameStyle | null;
	primary_guild?: PrimaryGuild | null;
	bot?: boolean;
	system?: boolean;
	banner?: string | null;
	accent_color?: number | null;
	public_flags?: number;
}

export interface AvatarDecorationData {
	asset: string;
	sku_id: Snowflake;
	expires_at: string | null;
}

export interface Collectibles {
	nameplate: NameplateData | null;
}

export interface NameplateData {
	asset: string;
	sku_id: Snowflake;
	label: string;
	palette: string;
	expires_at: number | null;
}

export interface DisplayNameStyle {
	font_id: number;
	effect_id: number;
	colors: number;
}

export interface PrimaryGuild {
	identity_enabled: boolean | null;
	identity_guild_id: Snowflake | null;
	tag: string | null;
	badge: string | null;
}

