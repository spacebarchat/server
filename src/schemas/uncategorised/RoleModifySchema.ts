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

export const RoleModifySchema = z
    .object({
        name: z.string(),
        permissions: z.string(),
        color: z.number(),
        hoist: z.boolean(),
        mentionable: z.boolean(),
        position: z.number(),
        icon: z.string(),
        unicode_emoji: z.string(),
        colors: z.object({
            primary_color: z.number(),
            secondary_color: z.number().nullish(),
            tertiary_color: z.number().nullish(),
        }),
    })
    .partial();

export type RoleModifySchema = z.infer<typeof RoleModifySchema>;
