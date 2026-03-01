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

import { z } from "zod";

export const ConnectedAccountSchema = z
    .object({
        external_id: z.string(),
        user_id: z.string(),
        token_data: z.any(),
        friend_sync: z.boolean(),
        name: z.string(),
        revoked: z.boolean(),
        show_activity: z.number(),
        type: z.string(),
        verified: z.boolean(),
        visibility: z.number(),
        integrations: z.array(z.string()),
        metadata_: z.any(),
        metadata_visibility: z.number(),
        two_way_link: z.boolean(),
        access_token: z.string(),
    })
    .partial({
        token_data: true,
        friend_sync: true,
        revoked: true,
        show_activity: true,
        verified: true,
        visibility: true,
        integrations: true,
        metadata_: true,
        metadata_visibility: true,
        two_way_link: true,
        access_token: true,
    });

export type ConnectedAccountSchema = z.infer<typeof ConnectedAccountSchema>;
