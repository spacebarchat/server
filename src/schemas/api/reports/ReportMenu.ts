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

export enum ReportMenuType {
    GUILD,
    GUILD_DISCOVERY,
    GUILD_DIRECTORY_ENTRY,
    GUILD_SCHEDULED_EVENT,
    MESSAGE,
    STAGE_CHANNEL,
    FIRST_DM,
    USER,
    APPLICATION,
    WIDGET,
}

export const ReportMenuTypeNames: Record<ReportMenuType, string> = {
    [ReportMenuType.GUILD]: "guild",
    [ReportMenuType.GUILD_DISCOVERY]: "guild_discovery",
    [ReportMenuType.GUILD_DIRECTORY_ENTRY]: "guild_directory_entry",
    [ReportMenuType.GUILD_SCHEDULED_EVENT]: "guild_scheduled_event",
    [ReportMenuType.MESSAGE]: "message",
    [ReportMenuType.STAGE_CHANNEL]: "stage_channel",
    [ReportMenuType.FIRST_DM]: "first_dm",
    [ReportMenuType.USER]: "user",
    [ReportMenuType.APPLICATION]: "application",
    [ReportMenuType.WIDGET]: "widget",
};
