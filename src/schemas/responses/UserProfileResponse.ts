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

import { EmojiResponse, PublicConnectedAccount, PublicMember, PublicUser, Snowflake } from "@spacebar/schemas";

export interface ProfileBadge {
    id: string;
    description: string;
    icon: string;
    link?: string;
}

export interface MutualGuild {
    id: string;
    nick?: string;
}

export interface ProfileMetadataResponse {
    pronouns: string;
    bio?: string;
    banner?: string | null;
    accent_color?: number | null;
    theme_colors?: [number, number] | null;
    popout_animation_particle_type?: Snowflake | null;
    emoji?: EmojiResponse | null;
    profile_effect?: ProfileEffect | null;
}

export interface GuildProfileMetadataResponse extends ProfileMetadataResponse {
    guild_id: Snowflake;
    accent_color?: null; // ignored by clients
}

export interface ProfileEffect {
    id: Snowflake;
    expires_at: number | null;
}

export interface UserProfileResponse {
    user: PublicUser;
    connected_accounts: PublicConnectedAccount;
    premium_guild_since?: Date;
    premium_since?: Date;
    mutual_guilds: MutualGuild[];
    premium_type: number;
    profile_themes_experiment_bucket: number;
    user_profile: ProfileMetadataResponse;
    guild_member?: PublicMember;
    guild_member_profile?: GuildProfileMetadataResponse;
    badges: ProfileBadge[];
}
