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

import { Guild } from "@spacebar/util";

export enum AdminGuildEnum {
	id,
	afk_channel_id,
	afk_channel,
	afk_timeout,
	bans,
	banner,
	default_message_notifications,
	description,
	discovery_splash,
	explicit_content_filter,
	features,
	primary_category_id,
	icon,
	large,
	max_members,
	max_presences,
	max_video_channel_users,
	members,
	roles,
	channels,
	template_id,
	emojis,
	stickers,
	invites,
	voice_states,
	webhooks,
	mfa_level,
	name,
	owner_id,
	owner,
	preferred_locale,
	premium_subscription_count,
	premium_tier,
	public_updates_channel_id,
	public_updates_channel,
	rules_channel_id,
	rules_channel,
	region,
	splash,
	system_channel_id,
	system_channel,
	system_channel_flags,
	unavailable,
	verification_level,
	welcome_screen,
	widget_channel_id,
	widget_channel,
	widget_enabled,
	nsfw_level,
	nsfw,
	parent,
	premium_progress_bar_enabled,
	channel_ordering,
}

export type AdminGuildKeys = keyof typeof AdminGuildEnum;
// A user that is returned to the admin
export type AdminGuild = Pick<Guild, AdminGuildKeys>;

export const AdminGuildProjection = Object.values(AdminGuildEnum).filter(
	(x) => typeof x === "string",
) as AdminGuildKeys[];
