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

import { ChannelPermissionOverwriteType, ChannelType } from "@spacebar/util";

export interface ChannelModifySchema {
	/**
	 * @maxLength 100
	 */
	name?: string;
	type?: ChannelType;
	topic?: string;
	icon?: string | null;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: {
		id: string;
		type: ChannelPermissionOverwriteType;
		allow: string;
		deny: string;
	}[];
	parent_id?: string;
	id?: string; // is not used (only for guild create)
	nsfw?: boolean;
	rtc_region?: string;
	default_auto_archive_duration?: number;
	default_reaction_emoji?: string | null;
	flags?: number;
	default_thread_rate_limit_per_user?: number;
	video_quality_mode?: number;
}
