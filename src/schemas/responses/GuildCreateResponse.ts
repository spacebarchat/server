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

// TODO: remove import from util
import { GuildWelcomeScreen } from "@spacebar/util";
import { GuildUpdateSchema } from "@spacebar/schemas";

export interface GuildCreateResponse extends Omit<GuildUpdateSchema, "name"> {
    id: string;
    name: string;
    large?: boolean;
    max_members?: number;
    max_presences?: number;
    max_video_channel_users?: number;
    member_count?: number;
    presence_count?: number;
    mfa_level?: number;
    owner_id?: string;
    premium_subscription_count?: number;
    premium_tier?: number;
    welcome_screen: GuildWelcomeScreen;
    widget_channel_id?: string;
    widget_enabled: boolean;
    nsfw_level?: number;
    nsfw: boolean;
    parent?: string;
}
