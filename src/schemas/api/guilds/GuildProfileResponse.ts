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

export interface GuildProfileResponse {
	id: string;
	name: string;
	icon_hash: string | null;
	member_count: number;
	online_count: number;
	description: string;
	brand_color_primary: string;
	banner_hash: string | null;
	game_application_ids: string[];
	game_activity: { [id: string]: GameActivity };
	tag: string | null;
	badge: GuildBadgeType;
	badge_color_primary: string;
	badge_color_secondary: string;
	badge_hash: string;
	traits: GuildTrait[];
	features: string[];
	visibility: GuildVisibilityLevel;
	custom_banner_hash: string | null;
	premium_subscription_count: number;
	premium_tier: number;
}

export interface GameActivity {
	activity_level: number;
	activity_score: number;
}

export interface GuildTrait {
	emoji_id: string | null;
	emoji_name: string | null;
	emoji_animated: boolean;
	label: string;
	position: number;
}

// TODO: move
export enum GuildVisibilityLevel {
	PUBLIC = 1,
	RESTRICTED = 2,
	PUBLIC_WITH_RECRUITMENT = 3,
}

export enum GuildBadgeType {
	SWORD = 0,
	WATER_DROP = 1,
	SKULL = 2,
	TOADSTOOL = 3,
	MOON = 4,
	LIGHTNING = 5,
	LEAF = 6,
	HEART = 7,
	FIRE = 8,
	COMPASS = 9,
	CROSSHAIRS = 10,
	FLOWER = 11,
	FORCE = 12,
	GEM = 13,
	LAVA = 14,
	PSYCHIC = 15,
	SMOKE = 16,
	SNOW = 17,
	SOUND = 18,
	SUN = 19,
	WIND = 20,
	BUNNY = 21,
	DOG = 22,
	FROG = 23,
	GOAT = 24,
	CAT = 25,
	DIAMOND = 26,
	CROWN = 27,
	TROPHY = 28,
	MONEY_BAG = 29,
	DOLLAR_SIGN = 30,
}
