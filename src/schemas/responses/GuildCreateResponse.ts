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

import { GuildWelcomeScreen } from "@spacebar/util";
import { GuildUpdateSchema } from "@spacebar/schemas"

export interface GuildCreateResponse extends Omit<GuildUpdateSchema, "name"> {
	id: string;
	name: string;
	primary_category_id: string | undefined;
	large: boolean | undefined;
	max_members: number | undefined;
	max_presences: number | undefined;
	max_video_channel_users: number | undefined;
	member_count: number | undefined;
	presence_count: number | undefined;
	template_id: string | undefined;
	mfa_level: number | undefined;
	owner_id: string | undefined;
	premium_subscription_count: number | undefined;
	premium_tier: number | undefined;
	welcome_screen: GuildWelcomeScreen;
	widget_channel_id: string | undefined;
	widget_enabled: boolean;
	nsfw_level: number | undefined;
	nsfw: boolean;
	parent: string | undefined;
}
