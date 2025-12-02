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

export interface MessageAcknowledgeSchema {
	manual?: boolean;
	mention_count?: number;
	flags?: ReadStateFlags | 0;
	last_viewed?: number;
	token?: string;
}

export interface AcknowledgeDeleteSchema {
	read_state_type?: ReadStateType;
	version?: number;
}

export enum ReadStateType {
	CHANNEL = 0,
	GUILD_EVENT = 1,
	NOTIFICATION_CENTER = 2,
	GUILD_HOME = 3,
	GUILD_ONBOARDING_QUESTION = 4,
	MESSAGE_REQUESTS = 5,
}

export enum ReadStateFlags {
	IS_GUILD_CHANNEL = 1 << 0,
	IS_THREAD = 1 << 1,
	IS_MENTION_LOW_IMPORTANCE = 1 << 2,
}