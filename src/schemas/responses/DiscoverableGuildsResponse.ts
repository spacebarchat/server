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

import { Snowflake, StickerResponse } from "@spacebar/schemas";
import { EmojiResponse } from "@spacebar/schemas/api/guilds/Emoji";

export interface DiscoverableGuildsResponse {
    total: number;
    guilds: DiscoverableGuild[];
    offset: number;
    limit: number;
}

export interface DiscoverableGuild {
    id: Snowflake;
    name: string;
    icon: string | null;
    description: string | null;
    banner: string | null;
    splash: string | null;
    discovery_splash: string | null;
    features: string[];
    vanity_url_code: string | null;
    preferred_locale: string;
    premium_subscription_count: number;
    approximate_member_count: number;
    approximate_presence_count: number;
    emojis?: EmojiResponse[];
    emoji_count?: number;
    stickers?: StickerResponse[];
    sticker_count?: number;
    auto_removed: boolean;
    primary_category_id: number;
    primary_category?: DiscoveryCategory;
    keywords: string[];
    is_published: boolean;
    reasons_to_join?: DiscoveryReason[];
    social_links?: string[];
    about?: string | null;
    category_ids?: Snowflake[];
    categories?: DiscoveryCategory[];
    created_at?: string;
    nsfw_properties?: DiscoveryNsfwProperties | null;
}

export interface DiscoveryCategory {
    id: number;
    name: string;
    is_primary: boolean;
}

export interface DiscoveryReason {
    reason: string;
    emoji_id?: Snowflake;
    emoji_name?: string;
}

export interface DiscoveryNsfwProperties {
    channels?: Snowflake[];
    channel_banned_keywords?: { [id: Snowflake]: string[] };
    name?: string;
    name_banned_keywords?: string[];
    description?: string;
    description_banned_keywords?: string[];
}
