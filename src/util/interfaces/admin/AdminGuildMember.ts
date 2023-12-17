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

import { Member } from "@spacebar/util";

export enum AdminGuildMemberEnum {
	id,
	guild_id,
	nick,
	roles,
	joined_at,
	premium_since,
	deaf,
	mute,
	pending,
	settings,
	last_message_id,
	joined_by,
	avatar,
	banner,
	bio,
	theme_colors,
	pronouns,
	communication_disabled_until,
}

export type AdminGuildMemberKeys = keyof typeof AdminGuildMemberEnum;
// A guild member that is returned to the admin
export type AdminGuildMember = Pick<Member, AdminGuildMemberKeys>;

export const AdminGuildMemberProjection = Object.values(
	AdminGuildMemberEnum,
).filter((x) => typeof x === "string") as AdminGuildMemberKeys[];
