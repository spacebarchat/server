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

export enum QuestFeature {
    POST_ENROLLMENT_CTA = 1,
    QUEST_BAR_V2 = 3,
    EXCLUDE_MINORS = 4, // removed from the client apparently
    EXCLUDE_RUSSIA = 5,
    IN_HOUSE_CONSOLE_QUEST = 6,
    MOBILE_CONSOLE_QUEST = 7,
    START_QUEST_CTA = 8,
    REWARD_HIGHLIGHTING = 9,
    FRACTIONS_QUEST = 10,
    ADDITIONAL_REDEMPTION_INSTRUCTIONS = 11,
    PACING_V2 = 12,
    DISMISSAL_SURVEY = 13,
    MOBILE_QUEST_DOCK = 14,
    QUESTS_CDN = 15,
    PACING_CONTROLLER = 16,
    QUEST_HOME_FORCE_STATIC_IMAGE = 17,
    VIDEO_QUEST_FORCE_HLS_VIDEO = 18,
    VIDEO_QUEST_FORCE_END_CARD_CTA_SWAP = 19,
    EXPERIMENTAL_TARGETING_TRAITS = 20,
    DO_NOT_DISPLAY = 21,
    EXTERNAL_DIALOG = 22,
    MOBILE_ONLY_QUEST_PUSH_TO_MOBILE = 23,
    MANUAL_HEARTBEAT_INITIALIZATION = 24,
    CLOUD_GAMING_ACTIVITY = 25,
    NON_GAMING_PLAY_QUEST = 26,
    ACTIVITY_QUEST_AUTO_ENROLLMENT = 27,
    PACKAGE_ACTION_ADVENTURE = 28,
    PACKAGE_RPG_MMO = 29,
    PACKAGE_RACING_SPORTS = 30,
    PACKAGE_SANDBOX_CREATIVE = 31,
    PACKAGE_FAMILY_FRIENDLY = 32,
    PACKAGE_HOLIDAY_SEASON = 33,
    PACKAGE_NEW_YEARS = 34,
}
