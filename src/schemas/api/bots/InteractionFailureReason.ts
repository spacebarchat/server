/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

export const enum InteractionFailureReason {
    UNKNOWN = 1,
    TIMEOUT = 2,
    ACTIVITY_LAUNCH_UNKNOWN_APPLICATION = 3,
    ACTIVITY_LAUNCH_UNKNOWN_CHANNEL = 4,
    ACTIVITY_LAUNCH_UNKNOWN_GUILD = 5,
    ACTIVITY_LAUNCH_INVALID_PLATFORM = 6,
    ACTIVITY_LAUNCH_NOT_IN_EXPERIMENT = 7,
    ACTIVITY_LAUNCH_INVALID_CHANNEL_TYPE = 8,
    ACTIVITY_LAUNCH_INVALID_CHANNEL_NO_AFK = 9,
    ACTIVITY_LAUNCH_INVALID_DEV_PREVIEW_GUILD_SIZE = 10,
    ACTIVITY_LAUNCH_INVALID_USER_AGE_GATE = 11,
    ACTIVITY_LAUNCH_INVALID_USER_VERIFICATION_LEVEL = 12,
    ACTIVITY_LAUNCH_INVALID_USER_PERMISSIONS = 13,
    ACTIVITY_LAUNCH_INVALID_CONFIGURATION_NOT_EMBEDDED = 14,
    ACTIVITY_LAUNCH_INVALID_CONFIGURATION_PLATFORM_NOT_SUPPORTED = 15,
    ACTIVITY_LAUNCH_INVALID_CONFIGURATION_PLATFORM_NOT_RELEASED = 16,
    ACTIVITY_LAUNCH_FAILED_TO_LAUNCH = 17,
    ACTIVITY_LAUNCH_INVALID_USER_NO_ACCESS_TO_ACTIVITY = 18,
    ACTIVITY_LAUNCH_INVALID_LOCATION_TYPE = 19,
    ACTIVITY_LAUNCH_INVALID_USER_REGION_FOR_APPLICATION = 20,
}
