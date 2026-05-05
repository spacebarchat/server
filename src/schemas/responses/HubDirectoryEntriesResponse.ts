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

import { HubGuild } from "./EmailDomainLookupResponse";

export enum HubDirectoryEntryType {
    Guild = 0,
    GuildScheduledEvent = 1,
}

export interface HubDirectoryGuild extends HubGuild {
    featurable_in_directory?: boolean;
}

export interface HubDirectoryEntry {
    author_id: string;
    created_at: string;
    description: string | null;
    directory_channel_id: string;
    entity_id: string;
    guild: HubDirectoryGuild;
    primary_category_id?: number;
    type: HubDirectoryEntryType;
}

export type HubDirectoryEntriesResponse = HubDirectoryEntry[];
