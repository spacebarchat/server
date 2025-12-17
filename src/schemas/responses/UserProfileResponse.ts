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

import { Badge, Member, User } from "@spacebar/util";
import { PublicConnectedAccount, PublicMember, PublicUser } from "@spacebar/schemas";

export type MutualGuild = {
    id: string;
    nick?: string;
};

export type PublicMemberProfile = Pick<Member, "banner" | "bio" | "guild_id"> & {
    accent_color: null; // TODO
};

export type UserProfile = Pick<User, "bio" | "accent_color" | "banner" | "pronouns" | "theme_colors">;

export interface UserProfileResponse {
    user: PublicUser;
    connected_accounts: PublicConnectedAccount;
    premium_guild_since?: Date;
    premium_since?: Date;
    mutual_guilds: MutualGuild[];
    premium_type: number;
    profile_themes_experiment_bucket: number;
    user_profile: UserProfile;
    guild_member?: PublicMember;
    guild_member_profile?: PublicMemberProfile;
    badges: Badge[];
}
