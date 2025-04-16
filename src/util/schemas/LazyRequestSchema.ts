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

export interface LazyRequestSchema {
	guild_id: string;
	channels?: {
		/**
		 * @items.type integer
		 * @minItems 2
		 * @maxItems 2
		 */
		[key: string]: number[][]; // puyo: changed from [number, number] because it breaks openapi
	};
	activities?: boolean;
	threads?: boolean;
	typing?: true;
	members?: string[];
	member_updates?: boolean;
	thread_member_lists?: unknown[];
}

export const LazyRequestSchema = {
	guild_id: String,
	$activities: Boolean,
	$channels: Object,
	$typing: Boolean,
	$threads: Boolean,
	$members: [] as string[],
	$member_updates: Boolean,
	$thread_member_lists: [] as unknown[],
};
