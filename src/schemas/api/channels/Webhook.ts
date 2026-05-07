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

import { Snowflake } from "../../Identifiers";
import { PartialUser } from "../users";

export enum WebhookType {
    Incoming = 1,
    ChannelFollower = 2,
    Application = 3,
}

export interface APIWebhook {
    id: Snowflake;
    type: WebhookType;
    guild_id?: Snowflake | null;
    channel_id?: Snowflake | null;
    user?: PartialUser | null;
    name: string | null;
    avatar: string | null;
    token?: string | null;
    application_id?: Snowflake | null;
    source_guild_id?: Snowflake | null;
    source_channel_id?: Snowflake | null;
    url?: string;
}
