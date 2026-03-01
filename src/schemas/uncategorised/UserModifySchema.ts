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
import { User_DisplayNameEffect, User_DisplayNameFont } from "discord-protos";

export const UserModifySchema = z
    .object({
        username: z.string().min(2),
        avatar: z.string().nullable(),
        bio: z.string(),
        accent_color: z.number(),
        banner: z.string().nullable(),
        password: z.string().min(1).max(72),
        new_password: z.string().min(1).max(72),
        code: z.string().min(6).max(6),
        email: z.email(),
        discriminator: z.string().min(4).max(4),
        display_name_colors: z.array(z.number()),
        display_name_effect_id: z.enum(User_DisplayNameEffect),
        display_name_font_id: z.enum(User_DisplayNameFont),
    })
    .partial();

export type UserModifySchema = z.infer<typeof UserModifySchema>;
