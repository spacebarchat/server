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

import { Snowflake } from "../../Identifiers";
import { ReportMenuType } from "./ReportMenu";

export type CreateReportRequiredField = keyof CreateReportSchema;

export const CreateReportRequiredFields: Record<ReportMenuType, CreateReportRequiredField[]> = {
    [ReportMenuType.GUILD]: ["guild_id"],
    [ReportMenuType.GUILD_DISCOVERY]: ["guild_id"],
    [ReportMenuType.GUILD_DIRECTORY_ENTRY]: ["guild_id", "channel_id"],
    [ReportMenuType.GUILD_SCHEDULED_EVENT]: ["guild_id", "guild_scheduled_event_id"],
    [ReportMenuType.MESSAGE]: ["channel_id", "message_id"],
    [ReportMenuType.STAGE_CHANNEL]: ["channel_id", "guild_id", "stage_instance_id"],
    [ReportMenuType.FIRST_DM]: ["user_id", "channel_id"],
    [ReportMenuType.USER]: ["reported_user_id"],
    [ReportMenuType.APPLICATION]: ["application_id"],
    [ReportMenuType.WIDGET]: ["user_id", "widget_id"],
};

export interface CreateReportSchema {
    version: string;
    variant: string;
    name: string;
    language: string;
    breadcrumbs: number[];
    elements?: { [key: string]: string[] };
    channel_id?: Snowflake;
    message_id?: Snowflake;
    guild_id?: Snowflake;
    stage_instance_id?: Snowflake;
    guild_scheduled_event_id?: Snowflake;
    reported_user_id?: Snowflake;
    application_id?: Snowflake;
    user_id?: Snowflake;
    widget_id?: Snowflake;
}
