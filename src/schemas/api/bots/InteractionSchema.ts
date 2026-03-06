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

import { ApplicationCommandOption, Snowflake, UploadAttachmentRequestSchema } from "@spacebar/schemas";
import { InteractionType } from "@spacebar/util";

export interface InteractionSchema {
    type: InteractionType;
    application_id: Snowflake;
    guild_id?: Snowflake;
    channel_id: Snowflake;
    message_id?: Snowflake;
    message_flags?: number;
    session_id?: string;
    data: InteractionData;
    files?: object[]; // idk the type
    nonce?: string;
    analytics_location?: string;
    section_name?: string;
    source?: string;
}

interface InteractionData {
    application_command: object;
    attachments: UploadAttachmentRequestSchema[];
    id: string;
    name: string;
    options: ApplicationCommandOption[];
    type: number;
    version: string;
}
