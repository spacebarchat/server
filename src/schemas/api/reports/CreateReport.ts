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

// TODO: check
export interface CreateReportSchema {
    version: string;
    variant: string;
    name: string;
    language: string;
    breadcrumbs: number[];
    elements?: { [key: string]: string[] };
    channel_id?: string; // snowflake
    message_id?: string; // snowflake
    guild_id?: string; // snowflake
    stage_instance_id?: string; // snowflake
    guild_scheduled_event_id?: string; // snowflake
    reported_user_id?: string; // snowflake
    application_id?: string; // snowflake
    user_id?: string; // snowflake
    widget_id?: string; // snowflake
}
