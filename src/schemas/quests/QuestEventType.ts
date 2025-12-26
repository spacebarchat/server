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

export enum QuestEventType {
    STREAM_ON_DESKTOP = "STREAM_ON_DESKTOP",
    PLAY_ON_DESKTOP = "PLAY_ON_DESKTOP",
    PLAY_ON_XBOX = "PLAY_ON_XBOX",
    PLAY_ON_PLAYSTATION = "PLAY_ON_PLAYSTATION",
    PLAY_ON_DESKTOP_V2 = "PLAY_ON_DESKTOP_V2",
    WATCH_VIDEO = "WATCH_VIDEO",
    WATCH_VIDEO_ON_MOBILE = "WATCH_VIDEO_ON_MOBILE",
    PLAY_ACTIVITY = "PLAY_ACTIVITY",
    ACHIEVEMENT_IN_GAME = "ACHIEVEMENT_IN_GAME",
    ACHIEVEMENT_IN_ACTIVITY = "ACHIEVEMENT_IN_ACTIVITY",
}
