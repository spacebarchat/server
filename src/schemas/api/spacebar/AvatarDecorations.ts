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

import { PartialUser, Snowflake } from "@spacebar/schemas";

export type PublicAvatarDecorationListResponse = PublicAvatarDecorationResponse[];
export type PrivateAvatarDecorationListResponse = PrivateAvatarDecorationResponse[];
export interface PublicAvatarDecorationResponse {
    id: Snowflake;
    approved: boolean;
    uploader: PartialUser;
    public: boolean;
    available: boolean;
}

export interface PrivateAvatarDecorationResponse extends PublicAvatarDecorationResponse {
    allowed_user_ids: Snowflake[];
    allowed_guild_ids: Snowflake[];
    allowed_role_ids: Snowflake[];
}

export interface UpdateAvatarDecorationSchema {
    public?: boolean;
    allowed_user_ids?: { add?: Snowflake[]; remove?: Snowflake[] };
    allowed_guild_ids?: { add?: Snowflake[]; remove?: Snowflake[] };
    allowed_role_ids?: { add?: Snowflake[]; remove?: Snowflake[] };
}
